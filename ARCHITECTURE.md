# Mental Note — Build Brief for Claude Code

**Domain:** mentalnote.org
**Launch:** early October 2026
**Built by:** two high school students, one of whom does all engineering
**Budget:** $0/month plus the domain. This is a hard constraint, not a preference.

---

## 0. Read this first

The design is already done. `site/` contains eight static HTML pages plus `styles.css`. **That markup and CSS is the spec.** Port it to Astro components — don't redesign it, don't "improve" the layout, don't swap the fonts.

Deliberate choices that look like mistakes but aren't:
- Asymmetric border radii (`1px 3px 2px 4px`) — hand-cut paper, not a typo
- Uneven section padding (112/96, 94/108) — machine-perfect rhythm reads as generated
- Grain overlays via inline SVG `feTurbulence` — matte paper, don't replace with a gradient
- `--rose #C4526B` appears **only** on crisis resources. Never a hover state, never a divider, never decorative.
- No streaks, no counters, no gamification anywhere

---

## 1. The rule that governs every decision below

> **Build the static site now. Build nothing else. But never make a choice that blocks accounts later.**

Concretely, that means: pick tools with a paid/scaled tier you could grow into, keep content in portable formats, and never write logic that assumes there is no user.

Each section below has a **Now** (build it) and a **Later** (leave the door open, write no code).

---

## 2. Frontend

**Now**
- **Astro 5**, static output (`output: 'static'`)
- Zero client JS by default. The only script in the current design is an `IntersectionObserver` for reveal-on-scroll — keep it inline, don't pull in a framework for it.
- Port `styles.css` as a global stylesheet plus component-scoped styles. Design tokens stay CSS custom properties on `:root` — do **not** move them into Tailwind config.
- Components: `Layout.astro`, `Header.astro`, `Footer.astro`, `CrisisBlock.astro`, `NoteCard.astro`, `PaperCard.astro`, `ThemeCalendar.astro`
- Self-host the fonts. Download the woff2 files for Cabinet Grotesk, Satoshi, Stardom (Fontshare) and Shantell Sans (Google) into `/public/fonts/`. Fontshare's CDN is not battle-tested and a school wifi connection will find that out. Use `font-display: swap` and keep the real fallback stacks already in the CSS.

**Later**
- Astro supports islands. When accounts arrive, add React or Svelte for the authenticated views only. The marketing pages stay static forever.
- If any page ever needs per-request rendering, switch that route to `export const prerender = false` — Astro allows hybrid rendering without a rewrite. This is the main reason Astro over a pure SSG.

**Don't**: add Tailwind, add a UI library, add a state manager. None of it is needed and all of it is weight.

---

## 3. Content

**Now**
- Astro Content Collections with **Zod schemas** in `src/content.config.ts`. Enforce the frontmatter — this is what prevents a byline typo from creating a phantom author.

```ts
articles: { title, date, author: enum(['co-founder-1','co-founder-2']), theme, slug, excerpt, draft: boolean }
themes:   { month, year, name, prompt, status: enum(['upcoming','open','archived']) }
notes:    { body, ageLabel, theme, publishedAt, source: enum(['seed','submission']) }
```

- `source: 'seed'` matters. The site publicly labels founder-written notes as seed notes. Keep that honest in the data model, not just the copy.
- **Sveltia CMS** at `/admin`, git-based, GitHub OAuth. Config mirrors the Zod schemas exactly.

**Acceptance test for this section:** the non-technical co-founder writes and publishes an article **from her phone**, without help, without touching git. If that fails, the whole content workflow fails — the founders' agreement gives her equal article ownership and this is what makes that real.

**Later**
- Markdown files migrate to any CMS or database with a script. That portability is the point of choosing git-based now.

---

## 4. APIs and backend

**Now: none.** There is no backend. Do not create one.

Form handling:
- **Note submissions** and **school booking enquiries** → Netlify Forms (free tier: 100 submissions/month) or an embedded Tally form. Either is fine; Tally is easier for the co-founder to edit.
- **Newsletter** → the email provider's embedded form, posting directly to them.

**Hard requirement:** note submissions and email addresses must go to **separate destinations with no shared identifier and no correlating timestamp**. The site publicly promises they're never linked. If they land in one spreadsheet row, the promise is false regardless of what the page says.

**Later**
- Netlify Functions or Cloudflare Workers when real endpoints are needed. Serverless keeps the zero-idle-cost property.
- If it grows past that, the whole static site can sit in front of any API — nothing about the current build constrains the choice.

---

## 5. Database and storage

**Now: none.**
- Articles, themes, and published notes are files in the repo.
- Check-in entries (when the app ships) live in the browser's `localStorage`. They never touch a server. This is a public promise on the homepage.

**Later**
- When accounts arrive: **Supabase** (Postgres, generous free tier, auth and storage bundled, RLS built in) or **Turso**. Postgres over anything proprietary, so the data can leave.
- **Design note for whoever builds it:** if check-ins ever sync to a server, they must be **client-side encrypted before upload**, with the key derived from the user's password. The current promise is "we can't read them." Breaking that quietly would be worse than never syncing at all. If sync ships, it ships as an explicit opt-in with a clear explanation of what changes.

---

## 6. Auth and permissions

**Now: none.** No login exists. Notes are anonymous — no name, no account, no email attached.

The only "permission" is the CMS: GitHub OAuth, both founders have write access to the repo.

**Later**
- Supabase Auth, Clerk, or Auth.js. Email magic links, not passwords, for a teenage audience.
- **Accounts must never be required to write a note or use the check-in.** Optional accounts add features (saved notes, cross-device history). Requiring them destroys the anonymity that is the site's core promise — and triggers COPPA and state teen-privacy obligations that don't currently apply.
- Roles when they exist: `anonymous` (default), `member`, `moderator`, `admin`.

---

## 7. Row-level security

**Now: N/A** — no database.

**Later, non-negotiable when one exists:**
- RLS **on** for every table from day one, deny-by-default. Never ship a table with RLS off "temporarily."
- A user reads and writes only their own rows. Moderators read the submission queue only. Nobody reads another user's check-ins — enforce it in the database, not the application layer.
- The `service_role` key never touches client code.

---

## 8. Hosting, deployment, CDN

**Now**
- **Netlify** free tier: 100GB bandwidth, global CDN, automatic HTTPS, deploy previews on PRs, instant rollback.
- `main` → production. Every PR → a preview URL. The co-founder can review a real rendered page before merge.
- Custom domain with automatic Let's Encrypt.
- Cloudflare Free in front is optional; Netlify's CDN is enough at your scale and one less thing to break.

**Later**
- Netlify handles far more traffic than you'll see. If a talk goes viral, static files on a CDN is the best possible position to be in — nothing to fall over.
- Migration path if ever needed: Cloudflare Pages or Vercel, both take Astro static output directly.

---

## 9. CI/CD and version control

**Now**
- GitHub, single repo, `main` is production.
- Both founders have write access. **Neither pushes to `main` directly** — PRs only, so the CMS-generated commits and hand-written code follow the same path.
- GitHub Actions on every PR: build, `astro check`, link check, Lighthouse CI (fail under 90 performance / 95 accessibility).
- **One extra check, custom, and it's the important one:** a script that greps the built output on every page for all four required strings and fails the build if any is missing:

```js
const REQUIRED = ['988', '741741', '800-799-7233', '88788'];
```

Crisis resources disappearing from a page is the only bug on this site that can actually hurt someone. Check the **built** output in `dist/`, not the source — it verifies what a visitor actually receives.

- A second check: fail the build if `data-quick-exit` is absent from any page (see §10a).

**Later**
- Add a `staging` branch when there are enough people to need one. Two people don't.

---

## 10a. Crisis resources — required on every page

Three resources, in `--rose`, in the footer, on every page without exception:

| Resource | Contact |
|---|---|
| 988 Suicide & Crisis Lifeline | call or text **988** |
| Crisis Text Line | text **HOME** to **741741** |
| National Domestic Violence Hotline | call **800-799-7233** · text **START** to **88788** · thehotline.org |

**Do not add the National Teen Dating Abuse Helpline until the number is verified by phone.** Published sources currently disagree (866-331-9474 vs 866-311-9474). A wrong crisis number is worse than no number. Same rule applies to any future addition: verify by calling, then add, then update the CI check.

### The quick exit — a DV-specific requirement

Domestic-abuse advocacy sites (NNEDV, thehotline.org) all implement this, because for someone being monitored, **browser history is itself a danger.** The audience here is teenagers who frequently don't control their own devices, so this matters more than it would elsewhere.

Requirements:
- A persistent **Leave this site** control, visible on every page, near the pinned crisis button
- Also bound to the **Escape key**, pressed twice
- On trigger: `window.location.replace('https://www.google.com/search?q=weather')` — `replace()`, not `href`, so the current page leaves no back-button trail
- Simultaneously `window.open('about:blank', '_blank')` to move focus off the page
- Mark it `data-quick-exit` so CI can verify it exists
- A short line beside the crisis block: if someone else can see this device, clear your browsing history after visiting — with a link to instructions

This is server-rendered static HTML with no history API tricks, so `replace()` is genuinely effective here.

---

## 10. Security

**Now**
- HTTPS enforced, HSTS on.
- CSP headers in `netlify.toml` — restrictive; the only external origins are the font files (self-hosted, so none) and the form provider.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- No secrets in the repo. There currently are none — verify that stays true.
- Dependabot on.

**The strongest security property you have right now is that you hold no user data.** Preserve that as long as possible. Every feature that starts collecting something is a real decision, not a small one.

**Later**
- Secrets in Netlify environment variables, never in code.
- A privacy policy reviewed by an actual lawyer before any account system ships. COPPA, California AADC, and several state teen-privacy laws all attach the moment you collect data from minors.

---

## 11. Rate limiting

**Now**
- Netlify Forms includes spam filtering; add a honeypot field.
- Do **not** add a CAPTCHA to the note form. Someone writing something vulnerable should not be asked to prove they're human. Accept some spam — a human reads every submission anyway.

**Later**
- Rate limit at the edge (Cloudflare or the Functions layer) if abuse appears. Per-IP, generous limits.

---

## 12. Caching and performance

**Now**
- Static HTML on a CDN. Hashed asset filenames, immutable cache headers on `/assets/*`, short cache on HTML.
- Astro handles image optimization — use `<Image />` for the founder photos and the note-wall photograph when they arrive.
- Budget: **under 200KB** on the homepage excluding fonts. Fonts are the heaviest thing here; subset them to Latin.
- Test on cell data on an actual phone, and **load the site on your school's wifi** — some district filters block domains categorized as mental health, and you want to know that in September.

---

## 13. Load balancing and scaling

Not applicable and won't be. Static files on a CDN scale to any traffic you will ever see. If a school assembly sends 400 students to the site at once, nothing happens. This is the main architectural advantage of the whole approach.

---

## 14. Error tracking and logs

**Now**
- **Sentry** free tier (5k errors/month) for client-side JS errors. There's barely any JS, so this is close to free insurance.
- **Plausible** or **Umami** for analytics — cookieless, no personal data, GDPR-clean. **Not Google Analytics.** The site publicly promises it doesn't track people; GA would make that false.
- Track aggregate only: page views, referrers, which theme pages get traffic, which talks page converts. Never anything per-individual.
- Netlify deploy logs and form submission logs cover the rest.

**Later**
- Structured logging when there's a backend. Never log note contents or check-in contents. Ever.

---

## 15. Availability and recovery

**Now**
- The entire site is a git repo. That *is* the backup. Any commit rebuilds the whole thing.
- Netlify keeps every previous deploy — rollback is one click.
- Form submissions export to CSV; download monthly and keep a copy off-platform.
- No database means nothing to lose and nothing to restore.

**Later**
- Daily automated Postgres backups, tested restores, documented RTO/RPO.

---

## 16. Repo structure

```
mentalnote/
├── src/
│   ├── components/
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── how-it-works.astro
│   │   ├── this-month.astro
│   │   ├── articles/index.astro + [slug].astro
│   │   ├── the-app.astro
│   │   ├── our-story.astro
│   │   ├── for-schools.astro
│   │   └── support.astro
│   ├── content/{articles,themes,notes}/
│   ├── content.config.ts
│   └── styles/global.css
├── public/{fonts,admin/{index.html,config.yml}}
├── .github/workflows/ci.yml
├── netlify.toml
└── astro.config.mjs
```

Routes match the current filenames exactly. `/for-schools` in particular is a URL that goes on a speaker sheet and gets emailed to principals — don't rename it.

---

## 17. Build order

1. Astro scaffold, Netlify connected, `main` auto-deploys
2. `Layout.astro` + header + footer + design tokens + self-hosted fonts
3. Port all eight pages, matching the HTML/CSS exactly
4. Content Collections + Zod schemas
5. Sveltia CMS → **then run the phone-publishing test before continuing**
6. Forms wired, with the separation requirement in §4 verified
7. CI: build, link check, Lighthouse, crisis-number check
8. Analytics, Sentry, security headers
9. PWA layer — manifest, service worker, install prompt *(deferred; see §18)*

---

## 18. Explicitly deferred

Leave clean seams, write no code:

| Deferred | Seam to leave |
|---|---|
| The check-in app (PWA) | A `/check-in` route reserved. Question bank as a JSON content collection so it's data, not code. Manifest and service worker are additive. |
| Native iOS/Android | Blocked until Oct 2027 — both stores require an account holder who is 18. The PWA wraps into a store app later via TWA or Capacitor without a rewrite. |
| User accounts | §6. Optional forever, never required. |
| Server-side note storage | §5. Files until manual publishing genuinely hurts — that pain is the signal, not a date. |
| Search | Pagefind drops into an Astro static build with no backend when the archive is big enough to need it. |
| Multi-author | The `author` enum is already there. Add values. |

---

## 19. Things that must stay true

A short list. If a change breaks one of these, it's the wrong change.

1. **988, Crisis Text Line (741741), and the DV Hotline (800-799-7233 / text START to 88788) appear on every page**, always, in `--rose`, and the CI check enforces it.
1b. **The quick-exit control exists on every page** and is CI-enforced.
2. **Check-ins never leave the device** unless explicitly re-architected with client-side encryption and clear user consent.
3. **Notes and emails are never linked.**
4. **No ads, no data sales, no third-party tracking.**
5. **The co-founder can publish without the engineer.**
6. **Accounts are never required to write a note.**
7. **Seed notes stay labeled as seed notes.**
8. **Both founders appear with equal prominence** on Our Story and For Schools.

---

## 20. Open items blocking content, not code

Use obvious placeholders; don't invent copy.

- The mission line (under 15 words) — homepage, meta descriptions
- School pricing and package details — `/for-schools`
- The check-in question bank (~30 sets × 3) — deferred with the app
- Founder photos and the note-wall photograph
