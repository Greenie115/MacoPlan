import { describe, it, expect } from 'vitest'
import { blogPosts } from '@/lib/blog-data'
import { relatedPosts, startHerePosts } from '@/lib/blog-links'

describe('blog links', () => {
  it('gives every post 3 related posts, never itself', () => {
    for (const post of blogPosts) {
      const related = relatedPosts(post)
      expect(related).toHaveLength(3)
      expect(related.map((p) => p.slug)).not.toContain(post.slug)
    }
  })

  it('ranks start-here posts by inbound links', () => {
    expect(startHerePosts('x').map((p) => p.slug)).toContain('decoding-macros')
  })

  it('keeps every seoTitle within 60 chars', () => {
    for (const post of blogPosts) expect((post.seoTitle ?? '').length).toBeLessThanOrEqual(60)
  })
})
