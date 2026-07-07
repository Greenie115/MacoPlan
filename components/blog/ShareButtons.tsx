'use client'

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="mt-12 border-t border-border-strong pt-8">
      <h3 className="mb-4 text-xl font-bold text-foreground [font-family:var(--font-display)]">Share this post</h3>
      <div className="flex flex-wrap justify-start gap-3">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-2.5 transition-colors duration-base ease-out-quint hover:border-coral-200 hover:text-coral-700"
        >
          <Twitter className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Twitter</span>
        </a>
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-2.5 transition-colors duration-base ease-out-quint hover:border-coral-200 hover:text-coral-700"
        >
          <Facebook className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Facebook</span>
        </a>
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-2.5 transition-colors duration-base ease-out-quint hover:border-coral-200 hover:text-coral-700"
        >
          <Linkedin className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">LinkedIn</span>
        </a>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-2.5 transition-colors duration-base ease-out-quint hover:border-coral-200 hover:text-coral-700"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
