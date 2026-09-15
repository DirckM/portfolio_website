-- Portfolio: newsletter subscribers and per-post feedback for dirckmulder.com.
--
-- SERVICE ROLE ONLY. No browser and no anon key ever reaches this schema: every
-- access goes through a Next.js route handler that holds the service key. So
-- anon and authenticated get no usage on the schema at all, and RLS is enabled
-- with no policies. Two independent locks, on purpose, because this is the
-- first schema in the shared project holding personal data belonging to other
-- people. Controller is Pure Studio, KVK 98665103.
--
-- Add 'portfolio' to Settings > API > Exposed schemas or every request returns
-- PGRST106 "Invalid schema", which looks exactly like a bad key. PostgREST
-- caches the list for about 90 seconds. Requests must send Accept-Profile:
-- portfolio on reads and Content-Profile: portfolio on writes.
--
-- THERE IS NO RAW IP COLUMN ANYWHERE. Consent proof needs a stable pseudonym,
-- not an address, so we store sha256(ip || SUBSCRIBER_HASH_SALT). The absence
-- of the column is what stops a careless "just log the IP" patch later.

create schema if not exists portfolio;

grant usage on schema portfolio to service_role;
alter default privileges for role postgres in schema portfolio
  grant all on tables to service_role;
alter default privileges for role postgres in schema portfolio
  grant all on sequences to service_role;

-- ---------------------------------------------------------------- subscribers

create table if not exists portfolio.subscribers (
  id                     uuid primary key default gen_random_uuid(),

  -- Normalised to lowercase in the route before insert, so the unique index is
  -- real rather than aspirational. The check enforces that invariant at the
  -- database rather than trusting every future caller to remember.
  email                  text not null unique
                           check (email = lower(email) and position('@' in email) > 1),

  status                 text not null default 'pending'
                           check (status in ('pending','confirmed','unsubscribed','bounced','complained')),

  -- Which mount point captured them, e.g. 'post:scroll-reveal-css'. Answers
  -- "where do signups actually come from" without a separate analytics join.
  source                 text not null default 'unknown',
  referrer_path          text,

  -- Double opt-in. Only the hash is stored, so a database leak cannot confirm
  -- anybody. The raw token exists in exactly one place: the email that was sent.
  confirm_token_hash     text unique,
  confirm_sent_at        timestamptz,
  confirm_expires_at     timestamptz,
  confirmed_at           timestamptz,

  -- Stable for the life of the subscriber. It is baked into the List-Unsubscribe
  -- header of every issue already delivered, so rotating it would break the
  -- unsubscribe link in mail that is already sitting in someone's inbox.
  unsubscribe_token_hash text not null unique,
  unsubscribed_at        timestamptz,

  -- GDPR Art. 7(1): proof of WHAT they agreed to, verbatim, at the moment they
  -- agreed. Copied from a server-side constant, never from the request body, so
  -- a client cannot claim weaker consent than it displayed. If the wording on
  -- the site changes, existing rows keep the wording those people actually saw.
  consent_text           text not null,
  consent_ip_hash        text,
  consent_user_agent     text,

  last_sent_at           timestamptz,
  bounce_count           integer not null default 0,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- The only hot query: "who gets this issue".
create index if not exists subscribers_confirmed
  on portfolio.subscribers (created_at) where status = 'confirmed';

-- Data minimisation: a weekly sweep deletes unconfirmed rows past their expiry.
create index if not exists subscribers_pending_sweep
  on portfolio.subscribers (confirm_expires_at) where status = 'pending';

-- The audit trail is the evidence, not the subscribers row. Every state change
-- appends here, including erasure, so an Art. 17 request can be proven done
-- after the row it refers to is gone. email_hash survives the delete.
create table if not exists portfolio.subscriber_events (
  id            bigint generated always as identity primary key,
  subscriber_id uuid references portfolio.subscribers(id) on delete set null,
  email_hash    text not null,
  event         text not null check (event in
                  ('signup','confirm_sent','confirmed','confirm_resent',
                   'unsubscribed','bounced','complained','erased','issue_sent')),
  meta          jsonb not null default '{}',
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists subscriber_events_sub
  on portfolio.subscriber_events (subscriber_id, created_at desc);

-- ------------------------------------------------------------------------ RLS
-- Enabled with no policies, deliberately. The service role bypasses RLS, so a
-- policy here would be decoration. What this actually buys is the inverse: if
-- the schema is ever exposed to anon by mistake, every row is invisible rather
-- than every row being public.

alter table portfolio.subscribers       enable row level security;
alter table portfolio.subscriber_events enable row level security;
