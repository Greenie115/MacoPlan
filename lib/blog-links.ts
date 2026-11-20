import { blogPosts, type BlogPost } from '@/lib/blog-data'

const linksOut = (post: BlogPost) =>
  [...post.content.matchAll(/href="\/blog\/([a-z0-9-]+)/g)].map((m) => m[1])

const inbound = new Map<string, number>()
for (const post of blogPosts)
  for (const slug of new Set(linksOut(post))) inbound.set(slug, (inbound.get(slug) ?? 0) + 1)

/** Evergreen posts the rest of the blog links to most. */
export function startHerePosts(exclude: string, n = 3) {
  return [...blogPosts]
    .filter((p) => p.slug !== exclude)
    .sort((a, b) => (inbound.get(b.slug) ?? 0) - (inbound.get(a.slug) ?? 0))
    .slice(0, n)
}

/** Posts this one links to or is linked from, then same-category neighbours by date. */
export function relatedPosts(post: BlogPost, n = 3) {
  const out = new Set(linksOut(post))
  const linked = blogPosts.filter(
    (p) => p.slug !== post.slug && (out.has(p.slug) || linksOut(p).includes(post.slug))
  )
  const t = new Date(post.date).getTime()
  const neighbours = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .sort((a, b) => Math.abs(new Date(a.date).getTime() - t) - Math.abs(new Date(b.date).getTime() - t))
  return [...new Set([...linked, ...neighbours])].slice(0, n)
}

/** Problem-led closing CTA per category. */
export const categoryCta: Record<string, { heading: string; body: string; button: string }> = {
  'Meal Prep': {
    heading: "Sunday prep shouldn't eat your whole Sunday.",
    body: 'Tell us your macros and how many containers to fill. You get a batch-cook plan in seconds.',
    button: 'Build my prep plan',
  },
  Recipes: {
    heading: 'Like this one? Get a whole week of it.',
    body: 'Meals like this, already portioned to your training-day and rest-day numbers.',
    button: 'Get my week of meals',
  },
  Nutrition: {
    heading: 'You know the theory. Now stop guessing what to cook.',
    body: 'Turn your numbers into a batch-cook plan you can actually follow this week.',
    button: 'Turn my macros into meals',
  },
}
