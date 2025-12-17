import { ReactNode } from 'react'

interface ProfileFormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ProfileFormSection({ title, description, children, className }: ProfileFormSectionProps) {
  return (
    <section className={className}>
      <div className="px-4">
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
        <div className="bg-card p-4 rounded-2xl shadow-sm border border-border-strong">
          {children}
        </div>
      </div>
    </section>
  )
}
