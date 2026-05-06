# CLAUDE conventions for Portfolio Website

You are working in the `portfolio` project. This file is the project repo's side of the bidirectional contract with the projects-hub.

## Hub registration

This project is registered in the projects-hub:

- **Hub root:** `~/Documents/dirck_projects/projects-hub/`
- **Project entry:** `projects/portfolio/project.md`
- **Slug:** `portfolio` — used as the metadata tag everywhere (PostHog `project` super-property, Stripe `metadata.project`, Resend tag value, ad campaign labels, etc.)

**Read the hub entry first** at the start of any non-trivial session. It contains the project's status, integrations, contacts, `depends_on`, `needs`, and priority metrics — context you should have before making changes.

## When to update the hub

Update the corresponding hub files when:

- **Project status changes** (idea → building → live, live → paused, etc.) → edit frontmatter `status:` and `stage:` in `projects/portfolio/project.md`.
- **Integration added or swapped** (e.g., wiring up PostHog, switching from Stripe to Lemon Squeezy) → update the `integrations:` block in the same file.
- **Deployment URL set or changed** → update `url:` in frontmatter.
- **Meaningful decision is made** (architecture, business model, scope, tooling pick) → append to `~/Documents/dirck_projects/projects-hub/projects/portfolio/decisions.md` with today's date as a heading.
- **Lesson learned** (a non-obvious fact worth remembering across projects) → append to `~/Documents/dirck_projects/projects-hub/projects/portfolio/lessons.md`.

**Do not duplicate lessons or decisions in this repo.** They live exclusively in the hub. This avoids the sync problem entirely.

## When wiring a shared service

Before adding any third-party integration, read the relevant infrastructure runbook in the hub:

- Analytics → `~/Documents/dirck_projects/projects-hub/infrastructure/posthog.md` (or whichever tool)
- Payments → `~/Documents/dirck_projects/projects-hub/infrastructure/stripe.md`
- Email → `~/Documents/dirck_projects/projects-hub/infrastructure/resend.md`
- Hosting → `~/Documents/dirck_projects/projects-hub/infrastructure/vercel.md`
- Errors → `~/Documents/dirck_projects/projects-hub/infrastructure/sentry.md`
- DNS → `~/Documents/dirck_projects/projects-hub/infrastructure/cloudflare.md`

Each runbook has the account-level conventions (metadata tagging, env var names, naming prefixes) so this project plugs in consistently with the others.

## Standards

See `~/Documents/dirck_projects/projects-hub/STANDARDS.md` for slug naming, file naming, frontmatter schema, allowed status/stage/revenue_model values, commit message prefixes, and the corporate-vs-personal separation rule.

## Hard rule — corporate separation

This is a personal project. **Never use any of the corporate (Trein-Vertraging) MCPs, skills, or hooks** — i.e., nothing from `mcp__plugin_tvt-config_*`, nothing under `~/.claude/plugins/cache/trein-vertraging/`, no `tvt-config:*` skills. They are wired to a different account and have no business here.
