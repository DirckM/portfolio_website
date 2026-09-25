-- One row per (issue, subscriber): who got which newsletter issue.
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
  resend_id              text,                       -- Resend's email id, the webhook join key
  sent_at                timestamptz,                -- null while reserved, set once Resend accepted it
  created_at             timestamptz not null default now(),
  unique (issue_slug, subscriber_id)
);

create index if not exists issue_sends_resend on portfolio.issue_sends (resend_id);

alter table portfolio.issue_sends enable row level security;

-- Explicit, in the same migration. The default privileges from 20260908_0001
-- already cover tables postgres creates in this schema, but the Data API grant
-- change of 30 October 2026 stops new tables inheriting access, and a grant
-- that lives in a later migration is one somebody forgets.
grant select, insert, update, delete on portfolio.issue_sends to service_role;
revoke all on portfolio.issue_sends from anon, authenticated;
