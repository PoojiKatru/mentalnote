// @ts-check
import { defineConfig } from 'astro/config';

// Static output now. The whole point of Astro over a pure SSG (per the brief) is
// that a single route can flip to `export const prerender = false` later without
// a rewrite when accounts arrive. Marketing pages stay static forever.
export default defineConfig({
  // The live address. mentalnote.org is NOT ours — someone else registered it and
  // it is mid-drop, so pointing `site` there would publish canonical URLs and a
  // sitemap for a domain we don't control. Change this only if we register it.
  site: 'https://mentalnote.pages.dev',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets', // hashed, immutable — matches the /assets/* cache rule in public/_headers
  },
});
