import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border text-foreground font-semibold hover:bg-accent transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
