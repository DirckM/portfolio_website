-- Newsletter issues: who got which issue (issue_sends), and the /designs
-- page behind each issue's "Get the code" button: every button press
-- (button_events), every share action with its own link (share_links), who
-- came in through one (share_visits) and who signed up from it
-- (subscribers.referred_by_share).
--
-- ADDITIVE ONLY. New tables, one new nullable column on subscribers. Nothing
-- existing is dropped, rewritten or back-filled.
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

-- --------------------------------------------------------- button events
-- Every press of a button on /designs/<slug> and on the blog's kit panel. One
-- row per press, written by a POST the browser makes on the click, never by a
-- page's GET: mail scanners and link prefetchers open links on their own and
-- must not count as anything.
--
-- subscriber_id is set when the browser holds a valid designs cookie (a
-- subscriber who came from their email), null otherwise. visitor_hash is the
-- salted hash of a random first-party cookie id, so one browser's presses can
-- be grouped without knowing who it is. ip_hash is the same salted pseudonym as
-- everywhere else, for the per-IP rate limit. No raw IP, no email.

create table if not exists portfolio.button_events (
  id            bigint generated always as identity primary key,
  page          text not null check (page in ('designs','blog-kit')),
  issue_slug    text check (issue_slug is null or issue_slug ~ '^[0-9]{4}-[0-9]{2}$'),
  kind          text not null check (kind in (
                  'page_view_token','download','share_click',
                  'copy_success','copy_failed',
                  'native_opened','native_completed','native_cancelled',
                  'form_open','form_submit')),
  subscriber_id uuid references portfolio.subscribers(id) on delete set null,
  share_id      text,
  visitor_hash  text,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists button_events_issue
  on portfolio.button_events (issue_slug, kind, created_at desc);
create index if not exists button_events_ip
  on portfolio.button_events (ip_hash, created_at desc);

-- ----------------------------------------------------------- share links
-- One row per share ACTION, not per subscriber, so every copied link can be
-- followed on its own: which ones were opened, and which were copied and never
-- used. The id is the ?ref= in the public URL: short, random, and never the
-- subscriber's token or email.
--
-- method is what the sharer did: 'copy' (clipboard), 'native' (the share sheet
-- opened and completed), 'native_cancelled' (the sheet was dismissed, so the
-- link most likely went nowhere).

create table if not exists portfolio.share_links (
  id            text primary key check (id ~ '^[A-Za-z0-9]{10}$'),
  issue_slug    text not null check (issue_slug ~ '^[0-9]{4}-[0-9]{2}$'),
  subscriber_id uuid not null references portfolio.subscribers(id) on delete cascade,
  method        text not null check (method in ('copy','native','native_cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists share_links_issue
  on portfolio.share_links (issue_slug, created_at desc);
create index if not exists share_links_sub
  on portfolio.share_links (subscriber_id);

-- Visits through a share link, one row per browser: a repeat visit from the
-- same first-party cookie is the same row. has_signed_up flips when that
-- browser then signs up from the page.

create table if not exists portfolio.share_visits (
  id            bigint generated always as identity primary key,
  share_id      text not null references portfolio.share_links(id) on delete cascade,
  visitor_hash  text not null,
  visited_at    timestamptz not null default now(),
  has_signed_up boolean not null default false,
  unique (share_id, visitor_hash)
);

-- Which share link brought a new subscriber in, and through it, who shared.
-- Text rather than a foreign key, so an erased sharer does not take the signup
-- with them. The subscribe route only stores an id it has looked up and found.
alter table portfolio.subscribers
  add column if not exists referred_by_share text;

create index if not exists subscribers_referred_by_share
  on portfolio.subscribers (referred_by_share) where referred_by_share is not null;

alter table portfolio.button_events enable row level security;
alter table portfolio.share_links   enable row level security;
alter table portfolio.share_visits  enable row level security;

-- Explicit, in the same migration. The default privileges from 20260908_0001
-- already cover tables postgres creates in this schema, but the Data API grant
-- change of 30 October 2026 stops new tables inheriting access, and a grant
-- that lives in a later migration is one somebody forgets.
grant select, insert, update, delete on portfolio.issue_sends to service_role;
grant select, insert, update, delete on portfolio.button_events to service_role;
grant select, insert, update, delete on portfolio.share_links to service_role;
grant select, insert, update, delete on portfolio.share_visits to service_role;
grant usage, select on all sequences in schema portfolio to service_role;
revoke all on portfolio.issue_sends from anon, authenticated;
revoke all on portfolio.button_events from anon, authenticated;
revoke all on portfolio.share_links from anon, authenticated;
revoke all on portfolio.share_visits from anon, authenticated;
