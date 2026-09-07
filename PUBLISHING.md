# Running Mental Note — the everyday guide

Everything here works from a phone. You never need to touch code, a terminal, or git.

**The admin page:** <https://mentalnote.pages.dev/admin>

Sign in with GitHub the first time. Bookmark it — that one page is where articles get
written, notes get approved, and weekly themes get set.

Three things live in there:

| You want to… | Go to | Section below |
|---|---|---|
| Write and publish an article | **Articles** | [1](#1-publishing-an-article) |
| Read notes people sent in, decide what goes on the wall | **Notes** | [2](#2-reviewing-anonymous-notes) |
| Change this week's writing prompt | **Weekly themes** | [4](#4-changing-the-weekly-theme) |

Newsletter emails are the one thing *not* in the admin page — that's [section 3](#3-finding-newsletter-emails).

---

## 1. Publishing an article

1. Open **/admin** → **Articles** → **New Article**.
2. Fill it in. Only two fields really need thought:
   - **Title**
   - **Article** — the body. The toolbar has bold, headings, and links.
3. The rest have defaults you can leave alone: who wrote it, theme, one-line summary,
   reading time, date.
4. **Untick "Keep as draft."** ← the step people miss. See the warning below.
5. Save, then use the workflow buttons to move it to **Ready** and hit **Publish**.

The site rebuilds itself and the article is live in about a minute.

> ### The one gotcha: "Keep as draft" is ticked by default
>
> There are **two** separate switches, and both must be right:
>
> 1. **Publish** in the CMS — merges your change into the site.
> 2. **Keep as draft** — a field on the article itself.
>
> An article can be fully published and *still be invisible* because "Keep as draft"
> is still ticked. The site filters those out on purpose, so you can finish something
> over several sittings without it appearing half-written.
>
> **If you published an article and can't find it on the site, this is why.** Reopen
> it, untick the box, publish again.

**Why there's a review step at all:** the CMS is set to `editorial_workflow`, so every
change becomes a pull request rather than editing the live site directly. It means a
mistake is never instantly public, and either founder can look before it goes out.

---

## 2. Reviewing anonymous notes

When someone submits a note on the "This week" page, it is saved as **Pending review**.
**Nothing a stranger writes appears on the site until one of you approves it.** That's
enforced in the code, not just policy — the site only renders notes marked `published`.

To review:

1. **/admin** → **Notes**.
2. Use the **Pending review** filter to see just the queue.
3. Open one and read it.
4. Then either:
   - **Publish it** — set *"Show on the wall?"* to **Published**, save, publish.
   - **Reject it** — delete the entry. It leaves the site entirely.

### Two things to know

**A note only shows on the wall if its theme matches the currently open theme.** If you
approve a note whose theme says "Enough" but this week's open theme is "Home," it won't
appear. Either change the note's theme field to match, or wait until that theme comes
around.

**If someone writes something worrying,** the moderation queue is not a crisis tool and
approving/deleting doesn't reach the person — notes are anonymous, with no email, no IP,
nothing that could identify them. There is no reply channel by design. If a note
suggests someone is in danger, the honest position is that you cannot contact them; what
you *can* do is make sure the crisis resources stay prominent on every page (CI checks
this automatically on every deploy). Decide between the two of you in advance how you'll
handle one, so it isn't decided at 1am by whoever sees it first.

---

## 3. Finding newsletter emails

Emails are **deliberately kept out of the CMS**, in a totally separate place from notes.
The site publicly promises that a person's note and their email are never linked, and
the way that promise is kept is structural: different form, different endpoint,
different folder, no shared ID. Keeping them apart is the feature.

**Where they are:** <https://github.com/PoojiKatru/mentalnote/tree/main/data/subscribers>

One file per signup. Each contains the email address and the date, nothing else.

To get the whole list at once, ask your engineer for an export — it's a one-line command.
Don't paste the list into a spreadsheet alongside note content; that would undo the
separation the site promises.

> **Currently empty** — no one has signed up yet, *or* the token in section 5 isn't set.
> If the site has been live and shared and this folder is still empty, check section 5.

---

## 4. Changing the weekly theme

**/admin** → **Weekly themes**. Each theme has a name, a writing prompt, a status, and
the Monday it starts.

Exactly one theme should be **Open now** at a time — that's the one the "This week" page
shows and the one new notes get attached to. When a week ends, set the old one to
**Archived** and the next one to **Open now**.

Themes are already filled in through the end of December 2026.

---

## 5. If forms stop working (or never started)

Both the note form and the email signup need a password-like key called `GITHUB_TOKEN`
stored in Cloudflare. Without it, submissions **fail silently** — the person sees a
normal thank-you page, but nothing is ever saved.

To check: **Cloudflare dashboard → Workers & Pages → mentalnote → Settings →
Environment variables.** There should be a `GITHUB_TOKEN` on **Production**.

If it's missing, create a GitHub token with **Contents: read and write** permission on
the `mentalnote` repo, add it there, then redeploy.

**Test it end to end:** submit a note through the real form, then look for it under
Pending review in the CMS. If it shows up, everything works. Delete your test note
afterward.

---

## Quick reference

| Thing | Where |
|---|---|
| The live site | <https://mentalnote.pages.dev> |
| Admin / CMS | <https://mentalnote.pages.dev/admin> |
| Newsletter emails | `data/subscribers/` in the GitHub repo |
| Hosting dashboard | Cloudflare → Workers & Pages → mentalnote |
| Code + history | <https://github.com/PoojiKatru/mentalnote> |

**Rollback:** every past version of the site is kept. Cloudflare → Workers & Pages →
mentalnote → Deployments → find a working one → **Rollback**. Nothing is ever lost.

**No custom domain yet.** The site lives at `mentalnote.pages.dev`. `mentalnote.org` is
*not* ours — a stranger registered it in 2025, never built anything on it, and let it
expire; it should become available to buy around late September 2026. Once you own a
domain, attach it in Cloudflare → Custom domains, and update `site` in
`astro.config.mjs`.
