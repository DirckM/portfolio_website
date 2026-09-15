-- Newsletter issues, per-recipient sends, delivery events, and exit reasons.
--
-- Same posture as 20260908_0001: service role only, RLS on with no policies,
-- and no raw IP anywhere. Additive, nothing existing is altered except the
-- subscriber_events check constraint, which is a closed enum and therefore
-- cannot be extended without a drop and re-add.
--
-- WHAT IS DELIBERATELY ABSENT: there is no opens table and no tracking pixel.
-- Roughly 62% of recorded email opens are Apple Mail Privacy Protection
-- prefetching images rather than people reading, Resend's own documentation
-- calls open tracking "not a statistically accurate way of detecting if your
-- users are engaging", and a pixel needs consent under ePrivacy Art. 5(3) /
-- art. 11.7a Telecommunicatiewet that this list has not asked for. Clicks are
-- measured with UTM parameters landing in PostHog on our own site instead.

-- ------------------------------------------------------------------- issues

create table if not exists portfolio.newsletter_issues (
  id                 uuid primary key default gen_random_uuid(),
  number             integer generated always as identity,
  slug               text not null unique,          -- '2026-09'
  status             text not null default 'draft'
                       check (status in ('draft','awaiting_approval','approved','sending','sent','cancelled','failed')),

  headline           text not null,
  headline_emphasis  text,
  standfirst         text not null default '',

  -- Built in TypeScript from real items with real URLs. The drafting model
  -- never chooses what goes in here, it only writes the prose inside it.
  sections           jsonb not null default '[]',

  -- Every fact the drafter was allowed to see, verbatim. This is what a
  -- validator checks the prose against, and the audit trail for "did it lie".
  source_facts       jsonb not null default '[]',

  covered_from       timestamptz not null,
  covered_through    timestamptz not null,          -- becomes the next issue's watermark

  approve_token_hash text unique,
  approve_expires_at timestamptz,
  preview_sent_at    timestamptz,
  approved_at        timestamptz,
  sent_at            timestamptz,

  recipient_count    integer not null default 0,
  sent_count         integer not null default 0,
  failed_count       integer not null default 0,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists issues_status
  on portfolio.newsletter_issues (status, created_at desc);

-- --------------------------------------------------------------- per-send log
-- The composite primary key IS the idempotency guarantee. A double tap on
-- approve, a retry after a timeout, or two functions racing cannot produce a
-- second send to the same person for the same issue.

create table if not exists portfolio.newsletter_sends (
  issue_id      uuid not null references portfolio.newsletter_issues(id) on delete cascade,
  subscriber_id uuid not null references portfolio.subscribers(id) on delete cascade,
  provider_id   text,                                -- Resend's email id, the webhook join key
  status        text not null default 'queued'
                  check (status in ('queued','sent','delivered','failed','bounced','complained')),
  error         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (issue_id, subscriber_id)
);

create index if not exists sends_provider on portfolio.newsletter_sends (provider_id);

-- ------------------------------------------------------------ delivery events
-- Separate from subscriber_events on purpose. That table is the consent audit
-- trail and has to stay readable by a human answering a GDPR request. This one
-- is machine exhaust and will always be the largest table here, so it should
-- not be allowed to bury the eight rows that actually matter legally.
--
-- Only sender-side delivery facts land here. No opens, no clicks: those are
-- access to someone else's device and carry a consent question this list has
-- not answered.

create table if not exists portfolio.email_events (
  id            bigint generated always as identity primary key,
  issue_id      uuid references portfolio.newsletter_issues(id) on delete set null,
  subscriber_id uuid references portfolio.subscribers(id) on delete set null,
  provider_id   text,
  event         text not null check (event in
                  ('sent','delivered','delivery_delayed','bounced','complained','failed','suppressed')),
  meta          jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists email_events_issue on portfolio.email_events (issue_id, created_at desc);
create index if not exists email_events_provider on portfolio.email_events (provider_id);

-- --------------------------------------------------------------- exit reasons
-- Collected AFTER the unsubscribe has already been committed, never before.
-- RFC 8058 allows a confirmation page on the manual GET path precisely because
-- a human is present; the machine POST path must complete with no UI at all.

create table if not exists portfolio.unsubscribe_reasons (
  id            bigint generated always as identity primary key,
  subscriber_id uuid references portfolio.subscribers(id) on delete set null,
  reason        text check (reason is null or reason in
                  ('too_many','not_relevant','got_what_i_came_for','dont_remember','other')),
  note          text check (note is null or length(note) <= 2000),
  created_at    timestamptz not null default now()
);

create index if not exists unsub_reasons_recent on portfolio.unsubscribe_reasons (created_at desc);

-- ---------------------------------------------- extend the audit event enum
-- subscriber_events.event is a closed check constraint, so a new value needs a
-- drop and re-add. Everything previously allowed stays allowed.

alter table portfolio.subscriber_events
  drop constraint if exists subscriber_events_event_check;

alter table portfolio.subscriber_events
  add constraint subscriber_events_event_check check (event in (
    'signup','confirm_sent','confirmed','confirm_resent',
    'unsubscribed','unsubscribe_reason','bounced','complained',
    'erased','issue_sent'
  ));

-- ------------------------------------------------------------------------ RLS

alter table portfolio.newsletter_issues   enable row level security;
alter table portfolio.newsletter_sends    enable row level security;
alter table portfolio.email_events        enable row level security;
alter table portfolio.unsubscribe_reasons enable row level security;
