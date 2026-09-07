# Mental Note

Teen mental health, peer-led. Static marketing site for **mentalnote.org**, built
with Astro 5. Zero runtime backend, zero user data — that is a feature, not a gap
(see `ARCHITECTURE.md` for the full build brief and the rules that govern it).

## Develop

```sh
npm install
npm run dev        # local dev server
npm run build      # static output -> dist/
npm run check      # astro check (types + content schemas)
npm run verify:crisis   # fails if any built page is missing a crisis resource
npm run fonts      # re-download self-hosted fonts (rarely needed; they're committed)
```

## The rules that must stay true

These are enforced, not aspirational (`ARCHITECTURE.md` §19):

1. **988, Crisis Text Line (741741), and the DV Hotline (800-799-7233 / 88788)
   appear on every page**, in `--rose`. CI (`npm run verify:crisis`) fails the
   build if any string is missing from the built output.
2. **The quick exit exists on every page** — CI-enforced via `data-quick-exit`.
3. **Notes and emails are never linked.** They are two separate endpoints
   (`this-month.astro`); the note's submit never carries the email.
4. No ads, no data sales, no third-party tracking.
5. **The co-founder can publish without the engineer** — Sveltia CMS at `/admin`.
6. Accounts are never required to write a note. Seed notes stay labelled `seed`.

Do not edit a crisis number without verifying it by phone first, and update the
`REQUIRED` list in `scripts/check-crisis.mjs` when the verified set changes.

## Content

Markdown in `src/content/{articles,themes,notes}/`, enforced by Zod schemas in
`src/content.config.ts`. The Sveltia CMS config (`public/admin/config.yml`)
mirrors those schemas — change one, change both.

## Deploy

Cloudflare Pages, static, `main` → production, PR → preview. Live at
<https://mentalnote.pages.dev>. Security headers, CSP, and cache rules live in
`public/_headers`; redirects in `public/_redirects`. Note and newsletter
endpoints are Pages Functions in `functions/api/`.

Before launch:

1. Set `GITHUB_TOKEN` in the Pages project (Settings → Environment variables),
   or both forms fail silently — see `PUBLISHING.md` §5.
2. Run the phone-publishing acceptance test (`ARCHITECTURE.md` §3).
3. Confirm the note and email forms land in separate destinations (§4).

## Day-to-day

**`PUBLISHING.md`** — how to publish an article, review anonymous notes, find
newsletter emails, and rotate the weekly theme. Written for a phone, no git.

## Structure

```
src/
  layouts/Layout.astro          head, grain, SOS, quick exit, reveal script
  components/                    Header, Footer, CrisisBlock, NoteCard, PaperCard, ThemeCalendar
  pages/                         the 8 routes + articles/[slug]
  content/                       articles, themes, notes (+ content.config.ts)
  styles/                        global.css (the design spec) + generated fonts.css
public/{fonts,admin}            self-hosted fonts + self-hosted Sveltia CMS
scripts/                        fetch-fonts.mjs, check-crisis.mjs
.github/workflows/ci.yml        astro check, build, crisis check, Lighthouse
```
