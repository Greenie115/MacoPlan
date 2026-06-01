import Link from 'next/link'

/**
 * MacroPlan macro-ring mark — three arcs representing protein / carbs / fat.
 * Uses theme CSS variables so it adapts to light and dark automatically.
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number
  className?: string
}) {
  const r = 13
  const c = 2 * Math.PI * r
  const seg = (frac: number, varName: string, offset: number) => {
    const dash = c * frac - 3
    const gap = c * (1 - frac) + 3
    return (
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={`var(${varName})`}
        strokeWidth={5}
        strokeDasharray={`${dash.toFixed(1)} ${gap.toFixed(1)}`}
        strokeDashoffset={(-c * offset).toFixed(1)}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
      />
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role="img"
      aria-label="MacroPlan"
      className={className}
    >
      {seg(0.42, '--color-macro-protein', 0)}
      {seg(0.33, '--color-macro-carbs', 0.42)}
      {seg(0.25, '--color-macro-fat', 0.75)}
    </svg>
  )
}

/**
 * Full logo lockup: macro-ring mark + "MacroPlan" wordmark, links to home.
 */
export function Logo({
  href = '/',
  className = '',
  markSize = 30,
  textClassName = 'text-xl font-bold tracking-tight',
}: {
  href?: string | null
  className?: string
  markSize?: number
  textClassName?: string
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} />
      <span className={textClassName}>MacroPlan</span>
    </span>
  )
  if (href === null) return inner
  return (
    <Link href={href} className="inline-flex items-center" aria-label="MacroPlan — Home">
      {inner}
    </Link>
  )
}
