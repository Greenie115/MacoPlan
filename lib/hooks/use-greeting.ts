'use client'

import { useState, useEffect } from 'react'
import { getGreeting } from '@/lib/utils/time-utils'

export function useGreeting(userName?: string) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(getGreeting(userName))
  }, [userName])

  return greeting
}
