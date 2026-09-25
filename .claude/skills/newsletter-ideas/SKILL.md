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

Every **Live** entry becomes a section in the issue data rendered by
`src/lib/email/issue.ts`, linking to the post. After the issue is sent, move those
entries to **Sent** as `issue #N`.

Publishing and sending stay behind Dirck's approval.
