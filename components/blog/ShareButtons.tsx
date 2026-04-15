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
    <div className="border-t border-border-strong pt-8 mt-12">
      <h3 className="text-xl font-bold mb-4">Share this post</h3>
      <div className="flex gap-3 flex-wrap justify-start">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border-strong rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <Twitter className="w-5 h-5" />
          <span className="font-medium text-sm">Twitter</span>
        </a>
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border-strong rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <Facebook className="w-5 h-5" />
          <span className="font-medium text-sm">Facebook</span>
        </a>
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border-strong rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <Linkedin className="w-5 h-5" />
          <span className="font-medium text-sm">LinkedIn</span>
        </a>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border-strong rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span className="font-medium text-sm">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
