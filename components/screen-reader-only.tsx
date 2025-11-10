import { ReactNode } from 'react'

interface ScreenReaderOnlyProps {
  children: ReactNode
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}
