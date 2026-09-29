---
name: newsletter-ideas
description: Capture and move newsletter ideas through idea → blog post → newsletter issue, using docs/newsletter-ideas.md. Use when Dirck says "save this for the newsletter", "idee voor de nieuwsbrief", "someone asked me how I…", "put this in the next issue", "what do we have for the newsletter", or when drafting a newsletter issue. Do NOT use for the weekly auto-generated component tutorials (that is docs/blog-queue.md and new-blog-post).
---

# Newsletter ideas

One file: `docs/newsletter-ideas.md` in the main checkout. Four stages:
Inbox → Writing → Live → Sent.

## Capture

Append one bullet to **Inbox** in the file's entry format.

- Keep the asker's question in their own words.
- Find the material yourself (hub-find, the product's `projects-hub/projects/<slug>/lessons.md`,
  decks in `projects-hub/decks/`). Never ask Dirck for paths.
- Commit it on a `docs/` branch and open a PR. `main` is protected.

## Write the post

When Dirck picks an idea:

1. Move it to **Writing** and fill in `post: <slug>`.
2. Write it with him. It is a story post from real work, so the weekly generator
   does not touch it and it never goes in `blog-queue.md`.
3. Once the post is merged and live, move it to **Live**.

## Build an issue

One typed data file per issue: `src/content/newsletter/<slug>.ts` (slug `YYYY-MM`),
registered in `src/content/newsletter/index.ts`. The type is `IssueFile` in
`src/lib/email/issue-file.ts`. Data only, never HTML: the design lives in
`src/lib/email/blocks.ts` and `issue.ts`, and placement is by rule in `toIssue()`.

Every **Live** entry becomes an item linking to its post. After the issue is
sent, move those entries to **Sent** as `issue #N`.

What every issue has:

- `cover`: its own banner, 1200x400 shown at 600x200 (short on purpose: on a phone it
  must leave the headline and item 01 on the first screen). One command:
  `node scripts/make-cover.mjs --number <n> --month <Month> --screen <video|image> --at <sec> --out public/email/cover-<slug>.jpg`
  (`--photo <image>` instead of `--screen` for a month without an app). Check the phone is whole.
- `items`: the first one is the lead. `type` is `web`, `app`, `reel` or `note`, and
  `layout()` picks the shape so no two neighbours match. Numbers (01, 02) come from layout.
- A `reel` item can carry `video: { src, poster }` (mp4 in public/email, H.264,
  faststart, ~480 wide, under ~3 MB) and `mark` (the host's own logo as a 2x PNG,
  fetched from their site, never redrawn). The video plays in Apple Mail, everyone else
  gets the still with the play mark (VIDEO_CSS in blocks.ts explains the switch).
  Thumbnail: `PLAY_Y=<% from top> node scripts/make-reel-thumb.mjs <video> <sec> public/email/reel-<name>.jpg`.
- `kit` (optional): a download for the whole list, under the lead, with a `badge: 'Free'`.
- `showcase`: "Made this month", 2 to 4 things Dirck designed, plus `credit` (required:
  who the originals are by, "unknown" is an honest answer) and `designs` for the
  "Get the code" button.
  - GIFs: `node scripts/make-email-gif.mjs <deterministic 60fps render.mp4> public/email/made-<slug>-<name>.gif --from <s>`.
    20 fps with a 5 cs delay is the only rate exact both in GIF and from 60 fps (12 fps
    gave uneven 8/9 cs delays and limped). It finds a seamless loop and also writes the
    mp4 the /designs page plays. Never feed it a real-time screen recording.
  - Zip: `pnpm make-showcase-zip <slug>` builds public/kits/showcase-<slug>-<hash>.zip
    from `designs.sources`, sanitises it and writes the name and size into the issue file.
- `status: 'draft'` until Dirck signs off the preview.

## The designs page

The "Get the code" button opens `/designs/<slug>?t=<designs token>`. A subscriber
downloads directly (the token becomes an HttpOnly cookie and leaves the URL) and gets a
Share button whose link is `/designs/<slug>?ref=<code>`, never the token. Anyone else
gets the newsletter form (source `designs:<slug>`), and the zip arrives in the welcome
email. Counting happens only on POSTs from clicks. Demand: `pnpm designs-stats <slug>`.

Writing rules, enforced by `validateIssueFile()` (test, preview and send all run it):
no semicolons, no em or en dashes. Also by hand: English, first person, dry and
specific, no "not X but Y", no hype, no fact that is not in a source you can name
(put the sources in the file's header comment). A product not in the App Store is
"building", never "launched".

## Preview

- `pnpm dev`, then `http://localhost:3000/api/newsletter/preview-issue?slug=<slug>`
  (add `&format=text` for the plain-text part). 404s in production.
- Or without a server: `pnpm render-issue <slug> /tmp/issue.html` and open the file.
- Look at it at 700 and 375 wide before calling it done.

## Send: Dirck's command, never Claude's

Claude writes the issue, previews it and runs the dry run. Claude never runs
`--test` to someone else's address and never runs `--send`. Sending is Dirck typing
it himself.

Once, before the first send: apply `supabase/migrations/20260925_0001_issue_sends.sql`.
A real send refuses to start without that table.

Run from the main checkout (it reads `.env.local`, then `projects-hub/.env`):

1. `pnpm send-issue <slug>`: dry run. Recipient count, subject, and the rendered HTML
   written to a temp file. Sends nothing, writes nothing.
2. `pnpm send-issue <slug> --test <his address>`: one copy, subject prefixed `[TEST]`,
   no database writes.
3. Set `status: 'approved'` in the issue file, merge it.
4. `pnpm send-issue <slug> --send`: every `confirmed` subscriber. Asks him to type the
   slug. Safe to re-run after a crash: `portfolio.issue_sends` skips whoever already got it.
5. Set `status: 'sent'`, move the ideas to **Sent**.

Each recipient gets their own unsubscribe token (hash stored on their `issue_sends`
row), the `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
headers, an HTML and a text part, and the Resend idempotency key
`issue/<slug>/<subscriber_id>`. The logic is `src/lib/newsletter-send.ts`, tested
without a network by `pnpm test:send-issue`.
