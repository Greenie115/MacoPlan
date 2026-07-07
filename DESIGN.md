# Design System — MacroPlan "Coral Pulse, Refined"

The premium-refined evolution of the existing Coral Pulse identity. Coral +
charcoal stay; craft, depth, motion, and rhythm get pushed to Linear/Vercel/
Stripe tier. **Additive** — every existing token still works; this layer elevates.

Reference lane: **Stripe-precision + Linear-craft**. Wow through polish and
restraint, never volume. If you're reaching for a loud effect, you're in the
wrong lane.

All tokens live in `app/globals.css` (`@theme` block, Tailwind v4). Consume them
as utilities — never hardcode a hex or a shadow.

---

## Color

**Identity (unchanged):** primary coral `#FF6B5C`, charcoal `#0B0F10`, macro
protein/carb/fat = coral / sky `#38BDF8` / amber `#FBBF24`.

**New: coral ramp** `--color-coral-50…950` (utilities `bg-coral-600`,
`text-coral-700`, `border-coral-200`, …). Use it for real states:
- `coral-500` — base brand, fills, dark-surface accents.
- `coral-600` — primary-button hover.
- `coral-700` — **coral as text on light** (passes 4.5:1; raw coral-500 does not).
- `coral-50/100` — tints for soft backgrounds, selected rows, badges.

Rules: coral marks primary action, current selection, live data, key emphasis.
Never decoration. Gray text on coral → use a coral shade or a white transparency,
never flat gray.

## Elevation (shadows)

Layered, charcoal-tinted (not pure black), low-opacity. The default Tailwind
shadow scale is **overridden** to these, so every existing `shadow-sm/md/lg/xl`
lifts to premium in place:
- `shadow-xs` hairline lift · `shadow-sm` resting cards · `shadow-md` raised
  cards, dropdowns · `shadow-lg` popovers, hovered cards · `shadow-xl` modals.
- `shadow-coral` — the coral glow reserved for primary CTAs (`shadow-coral`).
Dark mode uses deeper shadows automatically.

Surface layering: content on `bg-background`, panels/cards on `bg-card` with a
`border-strong` hairline + `shadow-sm`. Never nest cards. Sidebars/toolbars use
`bg-muted` as the second neutral layer.

## Typography

Families (unchanged): **Bricolage Grotesque** display (marketing headlines),
**Geist Sans** UI/body, **Geist Mono** for numeric/tabular data.

**New: fluid display scale** for brand surfaces (utilities `text-display-2xl`
… `text-display-md`), `clamp()`-based, max ≈4.5rem (never shout past the ceiling).
Use on marketing headlines only. Product UI keeps the fixed rem scale (`text-3xl`
and down) — no fluid headings in-app.

Rules: `tracking-tight` on display; letter-spacing never below −0.04em. Light
type on dark gets +0.05–0.1 line-height. `text-wrap: balance` on h1–h3,
`text-wrap: pretty` on prose. Numbers use `tabular-nums` + Geist Mono.

## Motion

Tokenized easing (utilities `ease-out-quint`, `ease-out-expo`) + durations
(`--duration-fast` 150ms / `--duration-base` 220ms / `--duration-slow` 400ms).
No bounce, no elastic — exponential ease-out only.

- **Marketing (brand):** one orchestrated page-load per section is allowed;
  earn it. Entrance states live inside `@media (prefers-reduced-motion:
  no-preference)` so reduced-motion users get a static, fully-visible page.
  Reveals enhance already-visible content — never gate visibility on JS.
- **App (product):** 150–250ms, state-only (hover/focus/active/loading). No
  page-load choreography; the app loads into a task.
- Premium materials beyond transform/opacity are welcome when smooth: subtle
  `backdrop-blur`, soft coral glow, grain, mesh gradients.

## Surface textures (marketing only)

- `.grain-overlay` — very faint SVG noise for dark heroes (kills banding, adds
  tactility). Pointer-events none, aria-hidden.
- `.premium-mesh` — layered radial coral glow for dark sections (replaces the
  hand-rolled inline radial gradients; consistent everywhere).

## Components

- **Button** — primary has subtle top-highlight depth + `shadow-coral` glow on
  hover, `active:scale-[0.97]`. Consistent across every surface; same shape.
- **Card** — `rounded-2xl`, `border-strong` hairline, `shadow-sm` at rest →
  `shadow-lg` + `-translate-y-0.5` + `border-coral-200/coral/20` on hover for
  interactive cards. Static cards don't lift.
- Every interactive element ships default/hover/focus/active/disabled. Loading =
  skeleton (`.skeleton` shimmer), not a centered spinner. Empty states teach.
- Focus: 2px coral ring, 2px offset — visible, never removed.

## The bar (anti-slop)

Banned: side-stripe borders, gradient text, decorative glassmorphism, hero-metric
template, identical icon-card grids, uppercase tracked eyebrow on every section,
numbered `01/02/03` scaffolding unless it's a real sequence, bounce easing,
layout-property animation, colored blocks where a product screenshot belongs.

The test: a visitor should ask *"how was this built?"* — not *"which AI made this?"*
