-- Per-post feedback and the A/B experiment behind it.
--
-- Same posture as the rest of the portfolio schema: service role only, RLS on
-- with no policies, no raw IP anywhere.
--
-- HONEST NOTE ON THE EXPERIMENT, recorded here because it is the thing most
-- likely to be misread later: at roughly 60 blog visitors a month this will not
-- reach statistical significance. Detecting a 10% versus 15% submission rate at
-- 80% power needs about 690 exposures per arm. The experiment is worth running
-- for the free-text answers, which are useful at n=5, and the numbers are a
-- tiebreaker rather than a verdict. Do not let a dashboard imply otherwise.

create table if not exists portfolio.post_feedback (
  id             uuid primary key default gen_random_uuid(),
  post_slug      text not null,
  experiment_key text not null default 'post-feedback-v1',
  variant        text not null,

  -- sha256(visitor_id || SUBSCRIBER_HASH_SALT). The raw id never leaves the
  -- browser, and there is no IP column here for the same reason as everywhere
  -- else in this schema.
  visitor_hash   text not null,

  -- Arm A answers with a verdict (-1 or 1). Arm B answers with a category.
  -- Two columns rather than one polymorphic blob, so a query for "how many
  -- people said not really" stays a query rather than a jsonb expedition.
  rating         smallint check (rating is null or rating between -1 and 5),
  choice         text check (choice is null or length(choice) <= 40),
  comment        text check (comment is null or length(comment) <= 2000),

  path           text,
  created_at     timestamptz not null default now(),

  -- One verdict per visitor per post. A second submission overwrites rather
  -- than inflating the numerator of the experiment.
  unique (experiment_key, post_slug, visitor_hash)
);

create index if not exists feedback_readout on portfolio.post_feedback (experiment_key, variant, created_at desc);
create index if not exists feedback_by_post on portfolio.post_feedback (post_slug, created_at desc);

-- The denominator. Aggregated per day, variant and post rather than one row per
-- pageview: an exposure row per view is an analytics product, not a table, and
-- it would dwarf every other table here within a month.
create table if not exists portfolio.experiment_exposures (
  day            date not null default current_date,
  experiment_key text not null,
  variant        text not null,
  post_slug      text not null,
  exposures      integer not null default 0,
  unique (day, experiment_key, variant, post_slug)
);

create or replace function portfolio.bump_exposure(
  p_experiment text, p_variant text, p_slug text
) returns void
language sql security definer set search_path = portfolio as $$
  insert into portfolio.experiment_exposures (day, experiment_key, variant, post_slug, exposures)
  values (current_date, p_experiment, p_variant, p_slug, 1)
  on conflict (day, experiment_key, variant, post_slug)
  do update set exposures = portfolio.experiment_exposures.exposures + 1;
$$;

revoke all on function portfolio.bump_exposure(text,text,text) from public;
grant execute on function portfolio.bump_exposure(text,text,text) to service_role;

alter table portfolio.post_feedback        enable row level security;
alter table portfolio.experiment_exposures enable row level security;
