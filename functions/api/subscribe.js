// Cloudflare Pages Function — newsletter signups -> a PRIVATE list in the repo,
// in a folder entirely separate from notes. This is the enforcement of the
// promise that notes and emails are never linked (brief §4 / §19.3): different
// endpoint, different destination folder, no shared identifier, and this function
// never receives or stores any note content.

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// Deliberately lenient — good enough to reject obvious junk, not to gatekeep.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function onRequest(context) {
  const { request, env } = context;
  const redirect = (path) => Response.redirect(new URL(path, request.url), 303);
  if (request.method !== 'POST') return redirect('/');

  const form = await request.formData();
  const honeypot = String(form.get('company') || '');
  const email = String(form.get('email') || '').trim().toLowerCase();

  if (honeypot || !EMAIL_RE.test(email) || email.length > 254) return redirect('/?subscribed=1');

  const TOKEN = env.GITHUB_TOKEN;
  const REPO = env.GITHUB_REPO || 'PoojiKatru/mentalnote';
  const BRANCH = env.GITHUB_BRANCH || 'main';
  if (!TOKEN) return new Response('Newsletter signup is not configured yet.', { status: 500 });

  const now = new Date();
  const id = `${now.getTime()}-${crypto.randomUUID().slice(0, 8)}`;
  // Separate top-level folder — NOT under src/content, so it's never part of the
  // built site and never adjacent to notes.
  const path = `data/subscribers/${id}.txt`;
  const body = `${email}\n${now.toISOString().slice(0, 10)}\n`;

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'mentalnote-subscribe',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'subscribe: new signup [skip ci]',
      content: toBase64(body),
      branch: BRANCH,
    }),
  });

  if (!res.ok) {
    console.error('GitHub commit failed', res.status, await res.text());
    return new Response('Could not save your email right now. Please try again.', { status: 502 });
  }
  return redirect('/?subscribed=1');
}
