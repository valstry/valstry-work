import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Graph edges: note slug or tool id (e.g. "note:slug" / "tool:id" or bare slug/id) */
    related: z.array(z.string()).default([]),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,yml,yaml}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { posts, tools };
