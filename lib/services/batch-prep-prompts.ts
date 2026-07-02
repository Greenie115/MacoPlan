import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'

export const BATCH_PREP_SYSTEM_PROMPT = `You are a meal prep planning engine for bodybuilders and strength athletes. You generate BATCH COOKING plans, not daily meal plans.

HARD RULES:
1. Output MUST be the XML-style tag format below — no prose, no markdown fences, no JSON, no code blocks.
2. Generate the number of distinct recipes specified in the user prompt. Each recipe is cooked ONCE and portioned into multiple containers across the week.
3. Every ingredient MUST have a gram weight. Never use "1 cup", "a handful", or "to taste".
4. Recipes must be batch-cookable: refrigeratable for 5 days minimum, bulk-scalable.
5. Reuse staple ingredients where sensible to keep the shopping list small, BUT recipes may share at most one primary protein and one staple carb. Every recipe must be clearly distinct in flavor and main components.
6. The batch-level <step> timeline MUST be in PREP ORDER (what goes in the oven first, what can cook in parallel), NOT meal order. Group by equipment priority: oven → rice_cooker → stovetop → none.
7. Each <meal> MUST contain 3–8 <instr> tags describing how to COOK that specific recipe from raw ingredients, in order. These are per-recipe cooking instructions, not reheating instructions and not the batch timeline. Do NOT include reheating/serving steps.
8. Each meal equipment attribute must be exactly one of: oven | rice_cooker | stovetop | none.
9. Training day daily totals and rest day daily totals MUST each be within 5% of the targets provided in the user prompt.
10. Spread protein 30–50g per meal; never concentrate 100g+ in a single sitting.
11. Respect dietary exclusions absolutely — no prohibited ingredients anywhere.
12. NEVER use the characters & < > inside ingredient names, meal names, step actions, instr text, or any tag content. Write the word "and" instead of "&". If you must include a quotation, use single quotes inside attribute values.
13. Every recipe MUST have a clear cuisine identity and a named sauce, marinade, or spice mix listed in its ingredients with gram weights (oils, sauces, and pastes count toward macros). NEVER output a plain unseasoned 'protein + carb + vegetable' bowl. Recipe names should reflect the dish (e.g. 'Gochujang Chicken Thigh Bowls', not 'Chicken and Rice').
14. MEALS PER DAY is a separate concept from weekly RECIPE COUNT. The user prompt states an exact "MEALS PER DAY: Generate exactly N meals..." target — follow it precisely for both the training day and the rest day. A day's meals do NOT need N distinct recipes; reuse that week's recipes across multiple meal slots/containers to reach the target meal count. When N is greater than 4, use multiple <meal slot="snack"> entries (e.g. two separate snack occasions) rather than inventing new slot names — the schema only accepts breakfast|lunch|snack|dinner.

MACRO REFERENCE (per 100g raw weight unless stated — CALIBRATION DATA, NOT A WHITELIST. Use ANY whole-food ingredient you know; estimate macros for unlisted ingredients from your nutrition knowledge and keep the math consistent):
Chicken breast: 165cal, 31g P, 0g C, 3.6g F
Chicken thigh (skinless): 177cal, 24g P, 0g C, 8.4g F
Lean ground beef (93/7): 152cal, 21g P, 0g C, 7g F
Salmon fillet: 208cal, 20g P, 0g C, 13g F
Whole eggs (2 large ~100g): 155cal, 13g P, 1.1g C, 11g F
Greek yogurt (2% fat): 73cal, 10g P, 4g C, 2g F
White rice (cooked): 130cal, 2.7g P, 28g C, 0.3g F
Brown rice (cooked): 123cal, 2.7g P, 26g C, 1g F
Sweet potato (cooked): 90cal, 2g P, 21g C, 0.1g F
Oats (dry): 389cal, 17g P, 66g C, 7g F
Broccoli: 34cal, 2.8g P, 7g C, 0.4g F
Spinach: 23cal, 2.9g P, 3.6g C, 0.4g F
Olive oil: 884cal, 0g P, 0g C, 100g F
Peanut butter: 588cal, 25g P, 20g C, 50g F
Black beans (cooked): 132cal, 8.9g P, 24g C, 0.5g F
Avocado: 160cal, 2g P, 9g C, 15g F
Cheddar cheese: 403cal, 25g P, 1.3g C, 33g F
Turkey breast: 114cal, 24g P, 0g C, 1.5g F
Shrimp: 85cal, 20g P, 0g C, 0.5g F
White fish (cod): 82cal, 18g P, 0g C, 0.7g F
Firm tofu: 76cal, 8g P, 2g C, 4.5g F
Lentils (cooked): 116cal, 9g P, 20g C, 0.4g F
Chickpeas (cooked): 164cal, 8.9g P, 27g C, 2.6g F
Quinoa (cooked): 120cal, 4.4g P, 21g C, 1.9g F
Pasta (cooked): 158cal, 5.8g P, 31g C, 0.9g F
White potato (cooked): 87cal, 1.9g P, 20g C, 0.1g F
Corn tortillas: 218cal, 5.7g P, 45g C, 2.9g F
Cottage cheese (2%): 84cal, 11g P, 4.3g C, 2.3g F
Soy sauce: 53cal, 8g P, 4.9g C, 0.6g F
Coconut milk (canned): 197cal, 2g P, 2.8g C, 21g F
Salsa: 36cal, 1.5g P, 7g C, 0.2g F
Honey: 304cal, 0.3g P, 82g C, 0g F

VERIFICATION STEP — before outputting tags:
1. For each meal, multiply each ingredient's g by its per-gram macros to compute ingredient-level macros.
2. Sum all ingredient macros within each meal to get the meal's cal/p/c/f attributes.
3. Sum all meal totals within each day to get the day's cal/p/c/f attributes.
4. Compare day totals to the user's targets. If any macro is off by more than 5%, adjust portion sizes before outputting.

OUTPUT FORMAT — emit EXACTLY these tags. Attribute order does not matter, but attribute names must match exactly.

<plan total_containers="N" prep_time_mins="N">

<day type="training" cal="N" p="N" c="N" f="N">
<meal slot="breakfast|lunch|snack|dinner" equipment="oven|rice_cooker|stovetop|none" servings="N" storage_days="N" cal="N" p="N" c="N" f="N">
<name>Recipe name here</name>
<ing name="chicken breast" g="150" cal="248" p="47" c="0" f="5"/>
<ing name="white rice cooked" g="200" cal="260" p="5" c="56" f="1"/>
<instr>Season chicken with salt, pepper, and paprika.</instr>
<instr>Sear chicken in a hot pan with olive oil, 4 minutes per side.</instr>
<instr>Cook rice in rice cooker with 1.5x water ratio.</instr>
<instr>Slice cooked chicken and portion over rice into containers.</instr>
</meal>
<!-- more <meal> blocks as needed -->
</day>

<day type="rest" cal="N" p="N" c="N" f="N">
<!-- same shape as training day -->
</day>

<step n="1" time="0:00" duration="5" equipment="oven">Preheat oven to 200C. Season the chicken thighs.</step>
<step n="2" time="0:05" duration="30" equipment="rice_cooker">Start rice cooker with rice and water.</step>
<!-- at least 3 steps, ordered by start time -->

<shop g="2000" category="protein">chicken thigh</shop>
<shop g="1500" category="grain">white rice</shop>
<!-- at least 3 shop items, category is one of: protein|grain|vegetable|dairy|fat|other -->

<container n="1" day="training" slot="lunch">Chicken and Rice Bowl</container>
<container n="2" day="training" slot="dinner">Ground Beef and Sweet Potato</container>
<!-- one container per portion, total count must equal the user's containers_per_week -->

</plan>

CRITICAL FORMATTING RULES:
- All numeric attribute values must be plain numbers (no units, no quotes around the number itself other than the attribute quotes).
- time attributes use the format H:MM (e.g. 0:00, 1:30).
- Every <ing> tag is self-closing with />.
- Every other tag opens and closes (<meal>...</meal>, <day>...</day>, <instr>...</instr>, <step>...</step>, <shop>...</shop>, <container>...</container>).
- Do NOT emit any text outside the <plan>...</plan> block.
- Do NOT wrap the output in markdown code fences.`

const VARIETY_RECIPE_COUNT: Record<string, string> = {
  low: '3–4',
  medium: '5–6',
  high: '7–8',
}

const VARIETY_MEALS_PER_DAY: Record<string, number> = {
  low: 3,
  medium: 4,
  high: 6,
}

/**
 * Batch-prep-friendly cuisines: bold flavors that survive 5 days in the
 * fridge. Sampled per generation so identical inputs still produce
 * different plans week to week. Also offered in the generator form for
 * per-meal-slot cuisine selection.
 */
export const CUISINE_POOL = [
  'American',
  'Mexican',
  'Tex-Mex',
  'Thai',
  'Korean',
  'Japanese',
  'Sichuan Chinese',
  'Indian',
  'Mediterranean',
  'Greek',
  'Italian',
  'Middle Eastern',
  'Moroccan',
  'Cajun/Creole',
  'Caribbean',
  'Vietnamese',
  'Spanish',
  'American BBQ',
  'Peruvian',
] as const

export function pickCuisines(count: number = 3): string[] {
  const shuffled = [...CUISINE_POOL]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

export interface VarietyOptions {
  /** Cuisines to draw this week's recipes from (see pickCuisines). */
  cuisines?: string[]
  /** Recipe names from the user's recent plans — must not be repeated. */
  avoidRecipes?: string[]
}

export function buildUserPrompt(
  profile: TrainingProfile,
  preferences: DietaryPreferences,
  variety: VarietyOptions = {}
): string {
  const td = profile.training_day_macros
  const rd = profile.rest_day_macros
  const restDaysPerWeek = 7 - profile.training_days_per_week

  const exclusionsBlock =
    preferences.exclusions.length > 0
      ? `\nEXCLUDE these ingredients entirely: ${JSON.stringify(preferences.exclusions)}`
      : ''

  const dietBlock = preferences.diet_type
    ? `\nDIET TYPE: ${JSON.stringify(preferences.diet_type)}`
    : ''

  const varietyCount = VARIETY_RECIPE_COUNT[preferences.meal_variety ?? 'medium']
  const varietyBlock = `\nRECIPE COUNT: Generate exactly ${varietyCount} distinct recipes. Use different recipes for training and rest days where possible to maximise variety.`

  // Per-slot cuisine choices take precedence; the rotation cuisines cover
  // any slots the user left open.
  const slotCuisines = Object.entries(preferences.meal_cuisines ?? {}).filter(
    ([, cuisine]) => typeof cuisine === 'string' && cuisine.length > 0
  ) as Array<[string, string]>

  const slotCuisineBlock =
    slotCuisines.length > 0
      ? `\nCUISINE BY MEAL SLOT (user-chosen — recipes for these slots MUST belong to the named cuisine, with an authentic sauce/seasoning identity):\n${slotCuisines
          .map(([slot, cuisine]) => `- ${slot}: ${JSON.stringify(cuisine)}`)
          .join('\n')}`
      : ''

  const cuisines = variety.cuisines ?? []
  const cuisineBlock =
    cuisines.length > 0
      ? slotCuisines.length > 0
        ? `\nFLAVOR DIRECTION: For meal slots WITHOUT a user-chosen cuisine above, draw recipes from: ${cuisines.join(', ')}. Each recipe should commit to one cuisine with an authentic sauce/seasoning identity — not a token spice on a plain bowl.`
        : `\nFLAVOR DIRECTION: Draw this week's recipes from these cuisines: ${cuisines.join(', ')}. Each recipe should commit to one cuisine with an authentic sauce/seasoning identity — not a token spice on a plain bowl.`
      : ''

  const avoidRecipes = variety.avoidRecipes ?? []
  const avoidBlock =
    avoidRecipes.length > 0
      ? `\nDO NOT REPEAT: The user already received these recipes in recent weeks. Do not generate them again, nor trivially renamed variants of them:\n${avoidRecipes.map((name) => `- ${name}`).join('\n')}`
      : ''

  const mealsPerDay = VARIETY_MEALS_PER_DAY[preferences.meal_variety ?? 'medium']
  const tPerMeal = {
    calories: Math.round(td.calories / mealsPerDay),
    protein_g: Math.round(td.protein_g / mealsPerDay),
    carbs_g: Math.round(td.carbs_g / mealsPerDay),
    fat_g: Math.round(td.fat_g / mealsPerDay),
  }
  const rPerMeal = {
    calories: Math.round(rd.calories / mealsPerDay),
    protein_g: Math.round(rd.protein_g / mealsPerDay),
    carbs_g: Math.round(rd.carbs_g / mealsPerDay),
    fat_g: Math.round(rd.fat_g / mealsPerDay),
  }

  return `Generate a batch meal prep plan for this lifter:

DAILY MACRO TARGETS:
- Training days (${profile.training_days_per_week}x/week): ${td.calories} cal | ${td.protein_g}g P | ${td.carbs_g}g C | ${td.fat_g}g F
- Rest days (${restDaysPerWeek}x/week): ${rd.calories} cal | ${rd.protein_g}g P | ${rd.carbs_g}g C | ${rd.fat_g}g F

MEALS PER DAY: Generate exactly ${mealsPerDay} meals for EACH day type (training and rest). This is separate from the weekly RECIPE COUNT below — reuse that week's recipes across multiple meal slots/containers rather than inventing extra recipes.${mealsPerDay > 4 ? ` Since ${mealsPerDay} exceeds the 4 named slots (breakfast|lunch|snack|dinner), use multiple <meal slot="snack"> entries (e.g. two separate snack occasions) instead of inventing new slot names.` : ''}

PER-MEAL BUDGET (${mealsPerDay} meals/day — aim for these per meal):
- Training: ~${tPerMeal.calories} cal | ~${tPerMeal.protein_g}g P | ~${tPerMeal.carbs_g}g C | ~${tPerMeal.fat_g}g F
- Rest: ~${rPerMeal.calories} cal | ~${rPerMeal.protein_g}g P | ~${rPerMeal.carbs_g}g C | ~${rPerMeal.fat_g}g F

PREFERENCES:
- Prep day: ${profile.prep_day}
- Containers to fill: ${profile.containers_per_week}
- Max prep session length: ${profile.max_prep_time_mins} minutes${dietBlock}${exclusionsBlock}${varietyBlock}${slotCuisineBlock}${cuisineBlock}${avoidBlock}

Return the plan using the <plan>...</plan> tag format from your instructions. No markdown, no prose, no JSON.`
}
