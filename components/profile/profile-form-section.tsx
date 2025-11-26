import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ProfileFormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ProfileFormSection({ title, description, children, className }: ProfileFormSectionProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  )
}
