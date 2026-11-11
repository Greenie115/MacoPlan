import Image from 'next/image'

/** Round avatar: the photo, or the first initial on a neutral tile. */
export function UserAvatar({ name, avatarUrl, size = 32 }: { name: string; avatarUrl: string | null; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground text-xs font-semibold text-background"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? <Image src={avatarUrl} alt="" fill className="object-cover" sizes={`${size}px`} /> : name.charAt(0).toUpperCase()}
    </span>
  )
}
