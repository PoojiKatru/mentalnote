// Public note submissions -> a PENDING markdown file committed to the (PRIVATE)
// repo, so a founder can approve/reject from the CMS. The human decision stays
// mandatory: pending notes never render on the site until status=published
// (brief §19.6 — "human decision, never automatic").
//
// IMPORTANT invariants:
//  - The repo MUST stay private. Unmoderated notes live here before review.
//  - Only the NOTE is handled here. Emails go to the separate Netlify "subscribe"
//    form and are never seen by this function (brief §4 / §19.3 — never linked).
//  - No IP, no identifier, no correlating data is stored with the note.
//  - No CAPTCHA; a honeypot only. We never make a vulnerable person prove they're
//    human, and we never tell a spammer they failed (brief §11).

const REPO = process.env.GITHUB_REPO || 'PoojiKatru/mentalnote';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;
const MAX_LEN = 2000;

export default async (req) => {
  const redirect = (path) => Response.redirect(new URL(path, req.url), 303);
  if (req.method !== 'POST') return redirect('/this-week');

  const form = await req.formData();
  const honeypot = String(form.get('bot-field') || '');
  const note = String(form.get('note') || '').trim();
  const theme = String(form.get('theme') || '').trim() || 'Notes to your future self';

  // Silently accept bots and empties — never reveal the honeypot, never block.
  if (honeypot || !note || note.length > MAX_LEN) return redirect('/note-received');

  if (!TOKEN) {
    console.error('GITHUB_TOKEN not set — cannot save note submissions');
    return new Response('Note submission is not configured yet.', { status: 500 });
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const id = `submission-${now.getTime()}-${crypto.randomUUID().slice(0, 8)}`;
  const path = `src/content/notes/${id}.md`;

  // JSON.stringify yields a safe double-quoted scalar (escapes quotes/newlines),
  // which is valid YAML — so arbitrary note text can't break the frontmatter.
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
      // [skip ci]: a pending note is invisible on the public site until a founder
      // approves it, so this commit must NOT trigger a build. The CMS still sees
      // the note immediately (it reads GitHub directly). A build only runs later,
      // when someone approves it. This keeps submissions free of build minutes.
      message: 'note: new submission (pending review) [skip ci]',
      content: Buffer.from(file, 'utf8').toString('base64'),
      branch: BRANCH,
    }),
  });

  if (!res.ok) {
    console.error('GitHub commit failed', res.status, await res.text());
    return new Response('Could not save your note right now. Please try again.', { status: 502 });
  }

  return redirect('/note-received');
};
