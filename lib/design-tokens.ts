/**
 * MacroPlan Design System Tokens
 * Centralized design system for consistent theming
 */

// Typography Scale
export const typography = {
  display: 'text-4xl font-bold', // 36px / 40px mobile, 48px desktop
  displayLg: 'text-4xl lg:text-5xl xl:text-6xl font-bold', // Responsive: 36px → 48px → 60px
  h1: 'text-3xl font-bold', // 30px / 32px
  h1Lg: 'text-3xl lg:text-4xl xl:text-5xl font-bold', // Responsive: 30px → 36px → 48px
  h2: 'text-2xl font-bold', // 24px
  h2Lg: 'text-2xl lg:text-3xl font-bold', // Responsive: 24px → 30px
  h3: 'text-xl font-semibold', // 20px
  h3Lg: 'text-xl lg:text-2xl xl:text-3xl font-semibold', // Responsive: 20px → 24px → 30px
  body: 'text-base font-normal', // 16px
  bodyLg: 'text-base lg:text-lg font-normal', // Responsive: 16px → 18px
  bodyMedium: 'text-base font-medium', // 16px
  bodyMediumLg: 'text-base lg:text-lg font-medium', // Responsive: 16px → 18px
  small: 'text-sm font-normal', // 14px
  smallMedium: 'text-sm font-medium', // 14px
  tiny: 'text-xs font-normal', // 12px
  tinyMedium: 'text-xs font-medium', // 12px
} as const

// Line Heights
export const lineHeight = {
  tight: 'leading-tight', // 1.2 - headings
  normal: 'leading-normal', // 1.5 - body text
  relaxed: 'leading-relaxed', // 1.625 - long-form content
} as const

// Semantic Colors (add to tailwind.config)
export const semanticColors = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    solid: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    solid: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    solid: 'bg-blue-500',
  },
} as const

// Macro Category Colors
export const macroColors = {
  protein: {
    primary: '#3B82F6', // blue-500
    light: '#DBEAFE', // blue-100
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    emoji: '🥩',
  },
  carbs: {
    primary: '#F97316', // orange-500 (more distinct than amber)
    light: '#FFEDD5', // orange-100
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    emoji: '🍞',
  },
  fat: {
    primary: '#A855F7', // purple-500 (very distinct)
    light: '#F3E8FF', // purple-100
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    emoji: '🥑',
  },
} as const

// Spacing Scale (base: 16px)
export const spacing = {
  xs: 'gap-2', // 8px
  sm: 'gap-3', // 12px
  md: 'gap-4', // 16px
  lg: 'gap-6', // 24px
  xl: 'gap-8', // 32px
  '2xl': 'gap-10', // 40px
} as const

// Container Padding (consistent across app)
export const container = {
  padding: 'px-4 sm:px-6 lg:px-8',
  maxWidth: 'max-w-7xl mx-auto',
} as const

// Card Styles
export const card = {
  padding: {
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  },
  elevation: {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
} as const

// Progress Bar Colors
export const progressColors = {
  onTrack: 'bg-green-500', // 90-110%
  warning: 'bg-amber-500', // 80-90% or 110-120%
  danger: 'bg-red-500', // <80% or >120%
} as const

// Chart-specific colors (for SVG elements)
export const chartColors = {
  background: '#E5E7EB', // gray-300 - unfilled ring background
  separator: '#D1D5DB', // gray-300 - center separator line
  labelSecondary: '#6B7280', // gray-500 - secondary text (labels)
  labelPrimary: '#1F2937', // gray-800 - primary text (main values)
} as const
