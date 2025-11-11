'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { macroColors, progressColors } from '@/lib/design-tokens'

interface MacroDonutChartProps {
  // Targets
  targetCalories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number

  // Progress
  caloriesEaten: number
  proteinEaten: number
  carbsEaten: number
  fatEaten: number

  // Sizing
  size?: 'sm' | 'md' | 'lg'

  // Interactive
  onSegmentClick?: (type: 'protein' | 'carbs' | 'fat') => void
  showTooltip?: boolean
}

export function MacroDonutChart({
  targetCalories,
  proteinGrams,
  carbGrams,
  fatGrams,
  caloriesEaten,
  proteinEaten,
  carbsEaten,
  fatEaten,
  size = 'md',
  onSegmentClick,
  showTooltip = true,
}: MacroDonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<
    'calories' | 'protein' | 'carbs' | 'fat' | null
  >(null)

  // Size configurations
  const sizeConfig = {
    sm: {
      width: 200,
      height: 200,
      outerRadius: 85,
      outerStroke: 20,
      innerRadius: 55,
      innerStroke: 16,
      fontSize: { large: 'text-2xl', medium: 'text-base', small: 'text-xs' },
    },
    md: {
      width: 280,
      height: 280,
      outerRadius: 120,
      outerStroke: 24,
      innerRadius: 78,
      innerStroke: 20,
      fontSize: { large: 'text-4xl', medium: 'text-xl', small: 'text-sm' },
    },
    lg: {
      width: 320,
      height: 320,
      outerRadius: 140,
      outerStroke: 28,
      innerRadius: 90,
      innerStroke: 24,
      fontSize: { large: 'text-5xl', medium: 'text-2xl', small: 'text-base' },
    },
  }

  const config = sizeConfig[size]
  const centerX = config.width / 2
  const centerY = config.height / 2

  // Calculate outer ring (calories)
  const caloriePercentage = Math.min(
    (caloriesEaten / targetCalories) * 100,
    100
  )
  const outerCircumference = 2 * Math.PI * config.outerRadius
  const outerProgress = (caloriePercentage / 100) * outerCircumference

  // Determine calorie progress color
  const getCalorieColor = () => {
    const percentage = (caloriesEaten / targetCalories) * 100
    if (percentage >= 90 && percentage <= 110) return '#10B981' // green
    if (
      (percentage >= 80 && percentage < 90) ||
      (percentage > 110 && percentage <= 120)
    )
      return '#F59E0B' // amber
    return '#EF4444' // red
  }

  // Calculate inner donut segments (macros)
  const totalMacrosEaten = proteinEaten + carbsEaten + fatEaten
  const innerCircumference = 2 * Math.PI * config.innerRadius

  const proteinPercentage =
    totalMacrosEaten > 0 ? (proteinEaten / totalMacrosEaten) * 100 : 0
  const carbsPercentage =
    totalMacrosEaten > 0 ? (carbsEaten / totalMacrosEaten) * 100 : 0
  const fatPercentage =
    totalMacrosEaten > 0 ? (fatEaten / totalMacrosEaten) * 100 : 0

  // Calculate segment dash arrays and offsets
  const proteinDash = (proteinPercentage / 100) * innerCircumference
  const carbsDash = (carbsPercentage / 100) * innerCircumference
  const fatDash = (fatPercentage / 100) * innerCircumference

  const proteinOffset = 0
  const carbsOffset = -proteinDash
  const fatOffset = -(proteinDash + carbsDash)

  // Tooltip content
  const getTooltipContent = () => {
    if (!hoveredSegment) return null

    switch (hoveredSegment) {
      case 'calories':
        return `${caloriesEaten.toLocaleString()} / ${targetCalories.toLocaleString()} cal (${Math.round(caloriePercentage)}%)`
      case 'protein':
        return `Protein: ${proteinEaten}g / ${proteinGrams}g (${Math.round((proteinEaten / proteinGrams) * 100)}%)`
      case 'carbs':
        return `Carbs: ${carbsEaten}g / ${carbGrams}g (${Math.round((carbsEaten / carbGrams) * 100)}%)`
      case 'fat':
        return `Fat: ${fatEaten}g / ${fatGrams}g (${Math.round((fatEaten / fatGrams) * 100)}%)`
      default:
        return null
    }
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={config.width}
        height={config.height}
        className="transform -rotate-90"
      >
        {/* Outer ring background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={config.outerRadius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={config.outerStroke}
        />

        {/* Outer ring progress (calories) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={config.outerRadius}
          fill="none"
          stroke={getCalorieColor()}
          strokeWidth={config.outerStroke}
          strokeDasharray={`${outerProgress} ${outerCircumference}`}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-700 ease-out',
            hoveredSegment === 'calories' && 'opacity-90'
          )}
          style={{
            animation: 'drawCircle 1s ease-out',
          }}
          onMouseEnter={() => setHoveredSegment('calories')}
          onMouseLeave={() => setHoveredSegment(null)}
        />

        {/* Inner donut background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={config.innerRadius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={config.innerStroke}
        />

        {/* Inner segment: Protein */}
        {proteinEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.innerRadius}
            fill="none"
            stroke={macroColors.protein.primary}
            strokeWidth={config.innerStroke}
            strokeDasharray={`${proteinDash} ${innerCircumference}`}
            strokeDashoffset={proteinOffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-700 ease-out cursor-pointer',
              hoveredSegment === 'protein' && 'opacity-80'
            )}
            style={{
              animation: 'drawCircle 1s ease-out 0.2s backwards',
            }}
            onMouseEnter={() => setHoveredSegment('protein')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => onSegmentClick?.('protein')}
          />
        )}

        {/* Inner segment: Carbs */}
        {carbsEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.innerRadius}
            fill="none"
            stroke={macroColors.carbs.primary}
            strokeWidth={config.innerStroke}
            strokeDasharray={`${carbsDash} ${innerCircumference}`}
            strokeDashoffset={carbsOffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-700 ease-out cursor-pointer',
              hoveredSegment === 'carbs' && 'opacity-80'
            )}
            style={{
              animation: 'drawCircle 1s ease-out 0.4s backwards',
            }}
            onMouseEnter={() => setHoveredSegment('carbs')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => onSegmentClick?.('carbs')}
          />
        )}

        {/* Inner segment: Fat */}
        {fatEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.innerRadius}
            fill="none"
            stroke={macroColors.fat.primary}
            strokeWidth={config.innerStroke}
            strokeDasharray={`${fatDash} ${innerCircumference}`}
            strokeDashoffset={fatOffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-700 ease-out cursor-pointer',
              hoveredSegment === 'fat' && 'opacity-80'
            )}
            style={{
              animation: 'drawCircle 1s ease-out 0.6s backwards',
            }}
            onMouseEnter={() => setHoveredSegment('fat')}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => onSegmentClick?.('fat')}
          />
        )}

        {/* Center text */}
        <g className="transform rotate-90" transform={`rotate(90 ${centerX} ${centerY})`}>
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className={cn(
              config.fontSize.large,
              'font-bold fill-charcoal'
            )}
          >
            {caloriesEaten.toLocaleString()}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className={cn(config.fontSize.small, 'fill-muted-foreground')}
          >
            / {targetCalories.toLocaleString()} cal
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredSegment && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-charcoal text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {getTooltipContent()}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-charcoal rotate-45" />
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 1000;
          }
        }
      `}</style>
    </div>
  )
}
