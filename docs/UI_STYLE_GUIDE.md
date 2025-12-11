# MacroPlan UI Style Guide

This document defines the UI design system for MacroPlan. All new features and components should follow these guidelines to maintain visual consistency across the app.

**Reference:** `ui_designs/stitch_macroplan_app_landing_page/brand_kit/`

---

## Color Palette

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#F97316` | Primary actions, CTAs, active states, links |
| `primary-foreground` | `#FFFFFF` | Text on primary backgrounds |

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#f8f6f5` | Page backgrounds |
| `card` | `#FFFFFF` | Card backgrounds, modals |
| `muted` | `#f8f6f5` | Subtle backgrounds, secondary areas |
| `accent` | `#FFF7ED` | Hover states, highlighted areas |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `foreground` | `#1c110d` | Primary text |
| `muted-foreground` | `#9c5f49` | Secondary text, captions |
| `icon` | `#9c5f49` | Lucide icons (non-active state) |

### Macro Colors

| Token | Value | Usage |
|-------|-------|-------|
| `protein` | `#ef4444` | Protein indicators, badges |
| `carb` | `#3b82f6` | Carbohydrate indicators |
| `fat` | `#eab308` | Fat indicators |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#22C55E` | Success states, confirmations |
| `warning` / `destructive` | `#DC2626` | Warnings, errors, destructive actions |

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `border` | `#e8d5ce` | Default borders |
| `border-strong` | `#e8d5ce` | Card borders, section dividers |
| `input` | `#e8d5ce` | Form input borders |

---

## Typography

- **Font Family:** Inter (via `next/font`)
- **Headings:** `font-bold` or `font-extrabold`
- **Body:** `font-normal` or `font-medium`
- **Labels:** `font-medium` or `font-semibold`
- **Buttons:** `font-semibold`

---

## Border Radius

| Size | Value | Usage |
|------|-------|-------|
| `rounded-lg` | `0.5rem` | Buttons (small) |
| `rounded-xl` | `1rem` | Buttons (large), inputs, badges |
| `rounded-2xl` | `1rem` | Cards, modals, dialogs |
| `rounded-full` | `9999px` | Avatars, progress indicators, tags |

---

## Component Patterns

### Cards

```tsx
<Card className="rounded-2xl border-border-strong bg-card shadow-sm">
  {/* content */}
</Card>
```

**Properties:**
- `rounded-2xl` - 16px border radius
- `border-border-strong` - Warm border color
- `bg-card` - White background
- `shadow-sm` - Subtle shadow

### Buttons

**Primary (Default):**
```tsx
<Button>Primary Action</Button>
// bg-primary text-white rounded-lg font-semibold
```

**Outline:**
```tsx
<Button variant="outline">Secondary Action</Button>
// border-2 border-primary text-primary bg-transparent
```

**Ghost:**
```tsx
<Button variant="ghost">Tertiary Action</Button>
// hover:bg-accent
```

**Large CTA:**
```tsx
<Button size="lg">Get Started</Button>
// h-12 rounded-xl text-base
```

### Form Inputs

```tsx
<Input placeholder="Enter value..." />
// h-11 rounded-xl border-input bg-card focus:ring-primary
```

**Properties:**
- Height: `h-11` (44px)
- Border radius: `rounded-xl`
- Background: `bg-card`
- Focus: `focus:ring-primary focus:border-primary`

### Badges/Tags

**Primary Tag:**
```tsx
<Badge variant="tag">Category</Badge>
// bg-primary/10 text-primary rounded-full
```

**Macro Badges:**
```tsx
<Badge variant="protein">180g</Badge>  // bg-protein/10 text-protein
<Badge variant="carbs">220g</Badge>    // bg-carb/10 text-carb
<Badge variant="fat">65g</Badge>       // bg-fat/10 text-fat
```

### Macro Display Pattern

Use colored backgrounds with colored text:

```tsx
<div className="grid grid-cols-3 gap-2">
  <div className="bg-protein/10 p-3 rounded-xl text-center">
    <p className="font-bold text-protein">180g</p>
    <p className="text-xs text-muted-foreground">Protein</p>
  </div>
  <div className="bg-carb/10 p-3 rounded-xl text-center">
    <p className="font-bold text-carb">220g</p>
    <p className="text-xs text-muted-foreground">Carbs</p>
  </div>
  <div className="bg-fat/10 p-3 rounded-xl text-center">
    <p className="font-bold text-fat">65g</p>
    <p className="text-xs text-muted-foreground">Fat</p>
  </div>
</div>
```

### Icons

**Default Icons:**
```tsx
<Bell className="size-5 text-icon" />
<ChevronRight className="size-5 text-icon" />
```

**Active/Selected Icons:**
```tsx
<Home className="size-6 text-primary" fill="currentColor" />
```

### Navigation

**Bottom Nav (Mobile):**
- Active: `text-primary` with filled icon
- Inactive: `text-icon`

**Sidebar (Desktop):**
- Active: `bg-primary text-primary-foreground`
- Inactive: `text-icon hover:text-foreground`

---

## Spacing Guidelines

- **Page padding:** `px-4` (mobile), `px-6` (tablet+)
- **Card padding:** `p-4` to `p-6`
- **Section spacing:** `py-6` to `py-8`
- **Element gaps:** `gap-2` to `gap-4`

---

## Dark Mode

Dark mode uses Tailwind's `.dark` class with these overrides:

| Token | Light | Dark |
|-------|-------|------|
| `background` | `#f8f6f5` | `#18181B` |
| `card` | `#FFFFFF` | `#27272a` |
| `foreground` | `#1c110d` | `#f4f4f5` |
| `muted-foreground` | `#9c5f49` | `#a1a1aa` |
| `border` | `#e8d5ce` | `#3f3f46` |
| `icon` | `#9c5f49` | `#d4d4d8` |

---

## Do's and Don'ts

### Do:
- Use semantic color tokens (`text-foreground`, `bg-card`)
- Use `rounded-2xl` for cards, `rounded-xl` for inputs/buttons
- Use `text-icon` for Lucide icons
- Use macro-specific colors for nutritional data
- Use `border-border-strong` for card borders

### Don't:
- Use hardcoded colors (`gray-500`, `slate-200`)
- Use `rounded-md` or `rounded-lg` for cards
- Use generic gray for macro indicators
- Mix different border radius styles inconsistently
- Use `border-border` for cards (use `border-border-strong`)

---

## Quick Reference

```
Primary:       #F97316 (orange)
Background:    #f8f6f5 (warm light gray)
Card:          #FFFFFF (white)
Text:          #1c110d (charcoal)
Secondary:     #9c5f49 (brown - icons, muted text)
Protein:       #ef4444 (red)
Carbs:         #3b82f6 (blue)
Fat:           #eab308 (amber)
Border:        #e8d5ce (warm beige)
Success:       #22C55E (green)
Destructive:   #DC2626 (red)
```

---

## Files to Reference

- `app/globals.css` - All CSS variables and theme tokens
- `components/ui/button.tsx` - Button variants
- `components/ui/card.tsx` - Card component
- `components/ui/badge.tsx` - Badge variants including macro colors
- `ui_designs/stitch_macroplan_app_landing_page/` - Original design mockups
