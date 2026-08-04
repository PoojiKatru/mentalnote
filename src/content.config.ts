import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Zod schemas enforce the frontmatter (brief §3). This is what stops a byline
// typo from creating a phantom author, and keeps `source: seed` honest in the
// data model rather than only in the copy. The Sveltia CMS config in
// /public/admin/config.yml mirrors these exactly.

const AUTHORS = ['co-founder-1', 'co-founder-2'] as const;

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.enum(AUTHORS),
    theme: z.string(), // display label, e.g. "Future self"
    excerpt: z.string(),
    minutes: z.number().int().positive(), // reading time shown in the byline
    draft: z.boolean().default(false),
  }),
});

const themes = defineCollection({
  loader: glob({ base: './src/content/themes', pattern: '**/*.md' }),
  schema: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
    name: z.string(),
    prompt: z.string(),
    status: z.enum(['upcoming', 'open', 'archived']),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    body: z.string(),
    ageLabel: z.string(), // e.g. "Anonymous, 15"
    theme: z.string(),
    publishedAt: z.date(),
    // The site publicly labels founder-written notes as seed notes. Keep that
    // honest here, not just in the copy (brief §3).
    source: z.enum(['seed', 'submission']),
  }),
});

export const collections = { articles, themes, notes };
