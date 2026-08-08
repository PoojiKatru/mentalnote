// Cloudflare Pages Function — public note submissions -> a PENDING markdown file
// committed to the (PRIVATE) repo for CMS review. Port of the Netlify function.
// Human decision stays mandatory: pending notes never render until approved
// (brief §19.6). Only the NOTE is handled here; emails go to /api/subscribe, a
// separate destination (brief §4 — never linked). No IP, no identifier stored.

const MAX_LEN = 2000;

// btoa is UTF-8-unsafe; encode to bytes first (note is short, so no chunking).
function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export async function onRequest(context) {
  const { request, env } = context;
  const redirect = (path) => Response.redirect(new URL(path, request.url), 303);
  if (request.method !== 'POST') return redirect('/this-week');

  const form = await request.formData();
  const honeypot = String(form.get('bot-field') || '');
  const note = String(form.get('note') || '').trim();
  const theme = String(form.get('theme') || '').trim() || 'Notes to your future self';

  // Silently accept bots and empties — never reveal the honeypot, never block a
  // real person, never add a CAPTCHA (brief §11).
  if (honeypot || !note || note.length > MAX_LEN) return redirect('/note-received');

  const TOKEN = env.GITHUB_TOKEN;
  const REPO = env.GITHUB_REPO || 'PoojiKatru/mentalnote';
  const BRANCH = env.GITHUB_BRANCH || 'main';
  if (!TOKEN) return new Response('Note submission is not configured yet.', { status: 500 });

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const id = `submission-${now.getTime()}-${crypto.randomUUID().slice(0, 8)}`;
  const path = `src/content/notes/${id}.md`;

  const file =
    `---\n` +
    `body: ${JSON.stringify(note)}\n` +
    `ageLabel: "Anonymous"\n` +
    `theme: ${JSON.stringify(theme)}\n` +
    `publishedAt: ${date}\n` +
    `source: submission\n` +
    `status: pending\n` +
    `---\n`;

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mentalnote-notes',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // [skip ci]: pending notes are invisible on the site until approved and the
      // CMS reads GitHub directly, so this commit must not trigger a build.
      message: 'note: new submission (pending review) [skip ci]',
      content: toBase64(file),
      branch: BRANCH,
    }),
  });

  if (!res.ok) {
    console.error('GitHub commit failed', res.status, await res.text());
    return new Response('Could not save your note right now. Please try again.', { status: 502 });
  }
  return redirect('/note-received');
}
