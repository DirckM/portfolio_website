-- Kit landing pages: /kits/<id> runs on the same tracking as /designs/<slug>.
--
-- NOT APPLIED automatically. Until it is, the code fails soft:
--  - kit page button events and kit share links are refused by the CHECK
--    constraints from 20260925_0001, which designs-db.ts logs and ignores. The
--    Share button still copies a link, a friend still gets the form, only the
--    referral credit and the counts are missing.
--  - the welcome and "already subscribed" emails cannot store a kit token, so
--    their kit button links the zip, as before (src/lib/kit-access.ts).
--
-- ADDITIVE ONLY. Three CHECK constraints are widened (every existing row
-- already satisfies the wider rule) and one table is added. Nothing is
-- dropped, rewritten or back-filled.
--
-- The giveaway key. button_events.issue_slug and share_links.issue_slug hold
-- the key of the page a row belongs to: an issue slug ('2026-09') for a
-- designs page, or 'kit:<id>' ('kit:app-demo') for a kit page. The column
-- keeps its name, so nothing reading it today breaks.

begin;

-- The constraints from 20260925_0001 were written inline, so Postgres named
-- them. Find them by table and column rather than trusting a guessed name.
do $$
declare c record;
begin
  for c in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace n on n.oid = rel.relnamespace
    join pg_attribute a on a.attrelid = rel.oid and a.attnum = any (con.conkey)
    where n.nspname = 'portfolio'
      and con.contype = 'c'
      and (
        (rel.relname = 'button_events' and a.attname in ('page', 'issue_slug'))
        or (rel.relname = 'share_links' and a.attname = 'issue_slug')
      )
  loop
    execute format('alter table portfolio.%I drop constraint %I', c.relname, c.conname);
  end loop;
end $$;

alter table portfolio.button_events
  add constraint button_events_page_check
  check (page in ('designs', 'blog-kit', 'kit'));

alter table portfolio.button_events
  add constraint button_events_issue_slug_check
  check (
    issue_slug is null
    or issue_slug ~ '^[0-9]{4}-[0-9]{2}$'
    or issue_slug ~ '^kit:[a-z0-9-]{1,40}$'
  );

alter table portfolio.share_links
  add constraint share_links_issue_slug_check
  check (
    issue_slug ~ '^[0-9]{4}-[0-9]{2}$'
    or issue_slug ~ '^kit:[a-z0-9-]{1,40}$'
  );

-- ------------------------------------------------------- giveaway tokens
-- The token in a welcome or "already subscribed" email's kit button, which
-- opens /kits/<id> for that subscriber. Those emails are not issue sends, so
-- they cannot use issue_sends.designs_token_hash. Stored as sha256 only, one
-- row per email, and never the unsubscribe token: a forwarded copy can
-- download a free zip and make share links, it cannot take anyone off the list.

create table if not exists portfolio.giveaway_tokens (
  token_hash    text primary key,
  giveaway      text not null check (giveaway ~ '^kit:[a-z0-9-]{1,40}$'),
  subscriber_id uuid not null references portfolio.subscribers(id) on delete cascade,
  email_kind    text not null check (email_kind in ('welcome', 'already-subscribed')),
  created_at    timestamptz not null default now()
);

create index if not exists giveaway_tokens_sub
  on portfolio.giveaway_tokens (subscriber_id);

alter table portfolio.giveaway_tokens enable row level security;

grant select, insert, update, delete on portfolio.giveaway_tokens to service_role;
revoke all on portfolio.giveaway_tokens from anon, authenticated;

commit;
