// TEMPORARY diagnostic — delete once the forms are confirmed working.
//
// Reports whether the Function can see GITHUB_TOKEN, and lists the NAMES of the
// bindings it does see. Names are not secrets and are what actually diagnose the
// common failures: a typo in the variable name, or the variable saved to the
// Preview environment instead of Production.
//
// The token's VALUE is never returned — only whether it exists and how long it
// is, which is enough to tell "missing" from "pasted with a truncation".

export async function onRequest(context) {
  const { env } = context;
  const token = env.GITHUB_TOKEN;

  return new Response(
    JSON.stringify(
      {
        hasToken: Boolean(token),
        tokenLength: token ? String(token).length : 0,
        // A correct fine-grained token starts github_pat_ and runs ~93 chars.
        looksLikeFineGrained: token ? String(token).startsWith('github_pat_') : false,
        looksLikeClassic: token ? String(token).startsWith('ghp_') : false,
        // Trailing whitespace from a sloppy paste breaks the Authorization header.
        hasStrayWhitespace: token ? String(token) !== String(token).trim() : false,
        bindingNames: Object.keys(env).sort(),
        repo: env.GITHUB_REPO || 'PoojiKatru/mentalnote (default)',
        branch: env.GITHUB_BRANCH || 'main (default)',
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
  );
}
