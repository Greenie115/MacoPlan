'use client'

import { macroColors } from '@/lib/design-tokens'

interface MacroRingProps {
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
}

export function MacroRing({
  proteinGrams,
  carbGrams,
  fatGrams,
  size = 'md',
  showLegend = false,
}: MacroRingProps) {
  // Calculate total and percentages
  const totalGrams = proteinGrams + carbGrams + fatGrams
  const proteinPercent = (proteinGrams / totalGrams) * 100
  const carbsPercent = (carbGrams / totalGrams) * 100
  const fatPercent = (fatGrams / totalGrams) * 100

  // Size mappings
  const sizes = {
    sm: { ring: 80, stroke: 12, fontSize: 'text-xs' },
    md: { ring: 120, stroke: 16, fontSize: 'text-sm' },
    lg: { ring: 160, stroke: 20, fontSize: 'text-base' },
  }

  const { ring, stroke, fontSize } = sizes[size]
  const radius = (ring - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate stroke dash offsets for each segment
  const proteinOffset = 0
  const carbsOffset = (proteinPercent / 100) * circumference
  const fatOffset = carbsOffset + (carbsPercent / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG Ring */}
      <svg width={ring} height={ring} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={stroke}
        />

        {/* Protein segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.protein.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(proteinPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={proteinOffset}
          strokeLinecap="round"
        />

        {/* Carbs segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.carbs.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(carbsPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-carbsOffset}
          strokeLinecap="round"
        />

        {/* Fat segment */}
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={macroColors.fat.primary}
          strokeWidth={stroke}
          strokeDasharray={`${(fatPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-fatOffset}
          strokeLinecap="round"
        />

        {/* Center text */}
        <text
          x={ring / 2}
          y={ring / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`${fontSize} font-bold fill-charcoal transform rotate-90`}
          transform={`rotate(90 ${ring / 2} ${ring / 2})`}
        >
          Macros
        </text>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: macroColors.protein.primary }}
            />
            <span>{Math.round(proteinPercent)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: macroColors.carbs.primary }}
            />
            <span>{Math.round(carbsPercent)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: macroColors.fat.primary }}
            />
            <span>{Math.round(fatPercent)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
