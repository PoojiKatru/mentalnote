// @ts-check
import { defineConfig } from 'astro/config';

// Static output now. The whole point of Astro over a pure SSG (per the brief) is
// that a single route can flip to `export const prerender = false` later without
// a rewrite when accounts arrive. Marketing pages stay static forever.
export default defineConfig({
  site: 'https://mentalnote.org',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets', // hashed, immutable — matches the /assets/* cache rule in netlify.toml
  },
});
