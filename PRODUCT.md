# Product

## Register

product

> MacroPlan is fundamentally a product/tool (the app is what users pay for), so
> `product` is the default register. But the **marketing surfaces** (`/`,
> `/pricing`, `/blog/*`, `/help`) are **brand-register** — design IS the product
> there; treat them with the brand reference. App surfaces (dashboard, meal
> plans, recipes, profile) serve the task and follow the product reference.

## Users

Lifters and serious gym-goers who actually meal prep — people who track macros,
cook in batches on a prep day, and eat from containers all week. They're
outcome-driven and time-poor: they want their week of eating solved in seconds,
not another calorie-counting chore. On the app daily; on the marketing site once,
skeptically, deciding whether this is real or another AI-slop fitness tool.

## Product Purpose

Turn a lifter's macro targets + prep day into a batch-cook plan (3–4 recipes,
one shopping list, one cooking timeline) in ~3 seconds. Success = the user cooks
once and hits their macros all week without thinking. The marketing surfaces
exist to make that promise feel credible and premium in the first five seconds.

## Brand Personality

Confident, precise, athletic. Speaks like a knowledgeable training partner — no
fluff, no fad-diet hype, real nutrition science stated plainly. Three words:
**precise, energetic, trustworthy**. The interface should feel like a high-end
performance tool (a good barbell, a Whoop, a Linear) — not a cutesy diet app.

Emotional goals: on the marketing site, *"this is the real thing, and it's for
me."* In the app, *calm competence* — the tool disappears into the task.

## Anti-references

- Generic AI-SaaS landing pages: cream/lavender gradients, floating 3D blobs,
  identical icon-card grids, "Supercharge your X" copy.
- Cutesy consumer diet apps (bright cartoon mascots, gamified confetti,
  rounded-everything baby UI). MacroPlan is for people who lift heavy.
- MyFitnessPal-style dense, dated, ad-cluttered utilitarian screens.
- Fake-testimonial trust theater and hero-metric template dashboards.

## Design Principles

1. **Precision is the aesthetic.** Wow comes from perfect spacing, crisp type,
   and buttery micro-interactions — Linear/Vercel/Stripe restraint, not volume.
   If a move is loud without being useful, cut it.
2. **Coral is a scalpel, not a paintbrush.** The one saturated color marks the
   primary action, live data, and key emphasis — never decoration. Charcoal +
   neutrals carry the surface; coral earns attention where it lands.
3. **Show the product, not adjectives.** Real macro rings, real prep cards, real
   numbers. Never "AI-powered" as a claim where a live demo would prove it.
4. **Dark is the signature; light is the daylight.** The charcoal + coral dark
   world is the brand's face (hero, CTAs, feature statements). Light surfaces
   are clean and calm for reading and working.
5. **Earned familiarity in the app.** In-app, a lifter fluent in Linear/Notion
   should trust every control instantly. Delight lives in moments, not on pages.

## Accessibility & Inclusion

WCAG AA. Body text ≥4.5:1 (coral text on light uses the coral-700 shade, never
raw coral-500). Full keyboard paths, visible focus rings, `prefers-reduced-motion`
honored on every animation (the marketing entrance choreography degrades to a
static, fully-visible page). Never convey macro state (protein/carb/fat) by color
alone — always pair with a label or number.
