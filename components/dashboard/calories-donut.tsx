'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { macroColors, chartColors } from '@/lib/design-tokens'

interface CaloriesDonutProps {
  targetCalories: number
  caloriesEaten: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  proteinEaten: number
  carbsEaten: number
  fatEaten: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

type SelectedMacro = 'protein' | 'carbs' | 'fat' | null

export function CaloriesDonut({
  targetCalories,
  caloriesEaten,
  proteinGrams,
  carbGrams,
  fatGrams,
  proteinEaten,
  carbsEaten,
  fatEaten,
  size = 'md',
}: CaloriesDonutProps) {
  const [selectedMacro, setSelectedMacro] = useState<SelectedMacro>(null)
  const [hoveredMacro, setHoveredMacro] = useState<SelectedMacro>(null)

  const activeMacro = hoveredMacro || selectedMacro
  // Size configurations - optimized stroke width for better visibility
  const sizeConfig = {
    xs: {
      width: 140,
      height: 140,
      radius: 52,
      stroke: 18,
      fontSize: { large: 20, medium: 14, small: 12 }, // Pixel values for SVG
    },
    sm: {
      width: 180,
      height: 180,
      radius: 66,
      stroke: 22,
      fontSize: { large: 24, medium: 16, small: 12 }, // Pixel values for SVG
    },
    md: {
      width: 240,
      height: 240,
      radius: 88,
      stroke: 28,
      fontSize: { large: 30, medium: 18, small: 14 }, // Pixel values for SVG
    },
    lg: {
      width: 280,
      height: 280,
      radius: 102,
      stroke: 32,
      fontSize: { large: 36, medium: 20, small: 14 }, // Pixel values for SVG
    },
    xl: {
      width: 340,
      height: 340,
      radius: 124,
      stroke: 38,
      fontSize: { large: 48, medium: 24, small: 16 }, // Pixel values for SVG
    },
  }

  const config = sizeConfig[size]
  const centerX = config.width / 2
  const centerY = config.height / 2
  const circumference = 2 * Math.PI * config.radius

  // Responsive separator line width (scales with size)
  const separatorHalfWidth = config.width * 0.18 // 18% of width on each side

  // Calculate calorie contributions from each macro
  const PROTEIN_CAL_PER_GRAM = 4
  const CARB_CAL_PER_GRAM = 4
  const FAT_CAL_PER_GRAM = 9

  const proteinEatenCal = proteinEaten * PROTEIN_CAL_PER_GRAM
  const carbEatenCal = carbsEaten * CARB_CAL_PER_GRAM
  const fatEatenCal = fatEaten * FAT_CAL_PER_GRAM

  // Calculate what percentage of total calories each consumed macro represents
  // This creates a continuous flow as you consume macros
  // Guard against division by zero
  const proteinFilledPercent = targetCalories > 0
    ? (proteinEatenCal / targetCalories) * 100
    : 0
  const carbFilledPercent = targetCalories > 0
    ? (carbEatenCal / targetCalories) * 100
    : 0
  const fatFilledPercent = targetCalories > 0
    ? (fatEatenCal / targetCalories) * 100
    : 0

  // Convert to circumference values (how much of the ring each macro fills)
  // Clamp total to 100% to handle over-consumption gracefully
  const totalFilledPercent = proteinFilledPercent + carbFilledPercent + fatFilledPercent
  const scaleFactor = totalFilledPercent > 100 ? 100 / totalFilledPercent : 1

  const proteinFilledSize = (proteinFilledPercent * scaleFactor / 100) * circumference
  const carbFilledSize = (carbFilledPercent * scaleFactor / 100) * circumference
  const fatFilledSize = (fatFilledPercent * scaleFactor / 100) * circumference

  // Calculate offsets to create continuous flow
  // Protein starts at 0
  // Carbs starts where protein ends
  // Fat starts where carbs ends
  const proteinOffset = 0
  const carbOffset = -proteinFilledSize
  const fatOffset = -(proteinFilledSize + carbFilledSize)

  // Calculate progress metrics for center display
  const totalProgress = Math.min((caloriesEaten / targetCalories) * 100, 100)
  const caloriesRemaining = Math.max(0, targetCalories - caloriesEaten)
  const isOnTrack = totalProgress >= 90 && totalProgress <= 110
  const isOver = caloriesEaten > targetCalories

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={config.width}
        height={config.height}
        className="transform -rotate-90"
      >
        {/* Background ring (full circle in gray) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={config.radius}
          fill="none"
          stroke={chartColors.background}
          strokeWidth={config.stroke}
        />

        {/* Protein segment - filled only */}
        {proteinEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.radius}
            fill="none"
            stroke={macroColors.protein.primary}
            strokeWidth={config.stroke}
            strokeDasharray={`${proteinFilledSize} ${circumference}`}
            strokeDashoffset={proteinOffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out cursor-pointer"
            style={{
              animation: 'drawCircle 1s ease-out 0.2s backwards',
              opacity: activeMacro === null || activeMacro === 'protein' ? 1 : 0.3,
            }}
            onClick={() => setSelectedMacro(selectedMacro === 'protein' ? null : 'protein')}
            onMouseEnter={() => setHoveredMacro('protein')}
            onMouseLeave={() => setHoveredMacro(null)}
            aria-label={`Protein: ${proteinEaten} of ${proteinGrams} grams consumed`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedMacro(selectedMacro === 'protein' ? null : 'protein')
              }
            }}
          />
        )}

        {/* Carbs segment - filled only */}
        {carbsEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.radius}
            fill="none"
            stroke={macroColors.carbs.primary}
            strokeWidth={config.stroke}
            strokeDasharray={`${carbFilledSize} ${circumference}`}
            strokeDashoffset={carbOffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out cursor-pointer"
            style={{
              animation: 'drawCircle 1s ease-out 0.4s backwards',
              opacity: activeMacro === null || activeMacro === 'carbs' ? 1 : 0.3,
            }}
            onClick={() => setSelectedMacro(selectedMacro === 'carbs' ? null : 'carbs')}
            onMouseEnter={() => setHoveredMacro('carbs')}
            onMouseLeave={() => setHoveredMacro(null)}
            aria-label={`Carbs: ${carbsEaten} of ${carbGrams} grams consumed`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedMacro(selectedMacro === 'carbs' ? null : 'carbs')
              }
            }}
          />
        )}

        {/* Fat segment - filled only */}
        {fatEaten > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={config.radius}
            fill="none"
            stroke={macroColors.fat.primary}
            strokeWidth={config.stroke}
            strokeDasharray={`${fatFilledSize} ${circumference}`}
            strokeDashoffset={fatOffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out cursor-pointer"
            style={{
              animation: 'drawCircle 1s ease-out 0.6s backwards',
              opacity: activeMacro === null || activeMacro === 'fat' ? 1 : 0.3,
            }}
            onClick={() => setSelectedMacro(selectedMacro === 'fat' ? null : 'fat')}
            onMouseEnter={() => setHoveredMacro('fat')}
            onMouseLeave={() => setHoveredMacro(null)}
            aria-label={`Fat: ${fatEaten} of ${fatGrams} grams consumed`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedMacro(selectedMacro === 'fat' ? null : 'fat')
              }
            }}
          />
        )}

        {/* Center content - always shows total calories */}
        <g
          className="transform rotate-90"
          transform={`rotate(90 ${centerX} ${centerY})`}
        >
          {/* "TOTAL" label */}
          <text
            x={centerX}
            y={centerY - 28}
            textAnchor="middle"
            fill={chartColors.labelSecondary}
            fontSize={config.fontSize.small}
            fontWeight="600"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Total
          </text>

          {/* Main calories display */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fill={chartColors.labelPrimary}
            fontSize={config.fontSize.large}
            fontWeight="700"
          >
            {Math.round(caloriesEaten).toLocaleString()}
          </text>

          {/* Separator line */}
          <line
            x1={centerX - separatorHalfWidth}
            y1={centerY + 8}
            x2={centerX + separatorHalfWidth}
            y2={centerY + 8}
            stroke={chartColors.separator}
            strokeWidth="1.5"
          />

          {/* Target calories */}
          <text
            x={centerX}
            y={centerY + 23}
            textAnchor="middle"
            fill={chartColors.labelSecondary}
            fontSize={config.fontSize.small}
            fontWeight="500"
          >
            {Math.round(targetCalories).toLocaleString()} cal
          </text>
        </g>
      </svg>

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
