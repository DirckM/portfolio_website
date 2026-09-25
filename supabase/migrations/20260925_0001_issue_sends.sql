-- Newsletter issues: who got which issue (issue_sends), and the /designs
-- page behind each issue's "Get the code" button (design_events,
-- referral_codes, subscribers.referred_by).
--
-- issue_sends: one row per (issue, subscriber).
--
-- Issues are typed files in src/content/newsletter/<slug>.ts, sent by
-- scripts/send-issue.ts, which Dirck runs locally. This table is what makes
-- that script safe to re-run after a crash: the unique key means nobody can get
-- the same issue twice, and a re-run skips every row with sent_at set.
--
-- A row is written BEFORE the email goes out (sent_at null, a reservation) and
-- completed after. A reservation left without sent_at means the run died
-- mid-send. The script resolves it with Resend's idempotency key, which is
-- `issue/<slug>/<subscriber_id>`, within Resend's 24 hour window.
--
-- WHY A TOKEN HASH LIVES HERE. Unsubscribe tokens are stored as sha256 only, so
-- the token in someone's welcome email cannot be read back to reuse in an
-- issue, and rotating subscribers.unsubscribe_token_hash would break the
-- unsubscribe link in every email they already have. So each send mints its own
-- token, and its hash is stored on this row. unsubscribeByToken() in
-- src/lib/newsletter.ts looks here when the subscriber row does not match.
--
-- Deliberately not newsletter_sends from 20260909_0001: that table hangs off
-- newsletter_issues rows (generated covered_from/covered_through windows, an
-- approval token) built for an automatic generator. Issues here are files in
-- git, and the approval is the status line in that file.
--
-- Same posture as the rest of the schema: service role only, RLS on with no
-- policies, no raw IP and no email address in this table.

create table if not exists portfolio.issue_sends (
  issue_slug             text not null check (issue_slug ~ '^[0-9]{4}-[0-9]{2}$'),
  subscriber_id          uuid not null references portfolio.subscribers(id) on delete cascade,
  unsubscribe_token_hash text not null unique,
  -- A second per-send token, for the "Get the code" button that opens
  -- /designs/<slug>. Separate from the unsubscribe token on purpose: that link
  -- gets opened, forwarded and scanned far more than a footer link, and a
  -- leaked copy of it must not be able to take anyone off the list. The worst
  -- it can do is download a free zip.
  designs_token_hash     text unique,
  resend_id              text,                       -- Resend's email id, the webhook join key
  sent_at                timestamptz,                -- null while reserved, set once Resend accepted it
  created_at             timestamptz not null default now(),
  unique (issue_slug, subscriber_id)
);

create index if not exists issue_sends_resend on portfolio.issue_sends (resend_id);

alter table portfolio.issue_sends enable row level security;

-- ------------------------------------------------------- designs: demand
-- Downloads and shares from /designs/<slug>. One row per click, recorded by a
-- POST from the page, never by the page's GET, so mail scanners and link
-- prefetchers that open the link do not count as downloads. subscriber_id is
-- null for nobody: only a reader with a valid token can download or share.
-- ip_hash is the same salted pseudonym as everywhere else, for the per-IP
-- rate limit.

create table if not exists portfolio.design_events (
  id            bigint generated always as identity primary key,
  issue_slug    text not null check (issue_slug ~ '^[0-9]{4}-[0-9]{2}$'),
  subscriber_id uuid not null references portfolio.subscribers(id) on delete cascade,
  kind          text not null check (kind in ('download','share')),
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists design_events_issue
  on portfolio.design_events (issue_slug, kind, created_at desc);
create index if not exists design_events_ip
  on portfolio.design_events (ip_hash, created_at desc);

-- ---------------------------------------------------------------- referrals
-- A short random code per subscriber, for the Share button's public link
-- /designs/<slug>?ref=<code>. It is never the email and never a token, so a
-- shared link says nothing about who shared it to anyone but Dirck.

create table if not exists portfolio.referral_codes (
  code          text primary key check (code ~ '^[A-Za-z0-9]{8,16}$'),
  subscriber_id uuid not null unique references portfolio.subscribers(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- Which code brought a new subscriber in. Text rather than a foreign key, so a
-- referrer who is erased later does not take the signup with them. The
-- subscribe route only stores a code it has looked up and found.
alter table portfolio.subscribers
  add column if not exists referred_by text;

create index if not exists subscribers_referred_by
  on portfolio.subscribers (referred_by) where referred_by is not null;

alter table portfolio.design_events  enable row level security;
alter table portfolio.referral_codes enable row level security;

-- Explicit, in the same migration. The default privileges from 20260908_0001
-- already cover tables postgres creates in this schema, but the Data API grant
-- change of 30 October 2026 stops new tables inheriting access, and a grant
-- that lives in a later migration is one somebody forgets.
grant select, insert, update, delete on portfolio.issue_sends to service_role;
grant select, insert, update, delete on portfolio.design_events to service_role;
grant select, insert, update, delete on portfolio.referral_codes to service_role;
revoke all on portfolio.issue_sends from anon, authenticated;
revoke all on portfolio.design_events from anon, authenticated;
revoke all on portfolio.referral_codes from anon, authenticated;
