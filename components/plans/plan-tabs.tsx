'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'Last Month', value: 'month' },
]

export function PlanTabs() {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'all'

  return (
    <div className="flex border-b border-gray-200">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.value
        return (
          <Link
            key={tab.value}
            href={`?tab=${tab.value}`}
            className={`flex flex-1 flex-col items-center justify-center border-b-[3px] py-3 transition-colors ${
              isActive
                ? 'border-primary'
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            <p
              className={`text-sm font-semibold leading-normal ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
