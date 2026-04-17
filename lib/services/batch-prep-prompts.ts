import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'

export const BATCH_PREP_SYSTEM_PROMPT = `You are a meal prep planning engine for bodybuilders and strength athletes. You generate BATCH COOKING plans, not daily meal plans.

HARD RULES:
1. Output MUST be the XML-style tag format below — no prose, no markdown fences, no JSON, no code blocks.
2. Generate 3–4 distinct recipes total. Each recipe is cooked ONCE and portioned into multiple containers across the week.
3. Every ingredient MUST have a gram weight. Never use "1 cup", "a handful", or "to taste".
4. Recipes must be batch-cookable: refrigeratable for 5 days minimum, bulk-scalable.
5. Maximise ingredient overlap between recipes (e.g. chicken thighs in 2 recipes, rice in 3 recipes) to shrink the shopping list and reduce waste.
6. Cooking instructions MUST be in PREP ORDER (what goes in the oven first, what can cook in parallel), NOT meal order. Group by equipment priority: oven → rice_cooker → stovetop → none.
7. Each meal equipment attribute must be exactly one of: oven | rice_cooker | stovetop | none.
8. Training day daily totals and rest day daily totals MUST each be within 5% of the targets provided in the user prompt.
9. Spread protein 30–50g per meal; never concentrate 100g+ in a single sitting.
10. Respect dietary exclusions absolutely — no prohibited ingredients anywhere.
11. NEVER use the characters & < > inside ingredient names, meal names, step actions, or any tag content. Write the word "and" instead of "&". If you must include a quotation, use single quotes inside attribute values.

MACRO REFERENCE (per 100g raw weight — use these for accuracy):
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
- Every other tag opens and closes (<meal>...</meal>, <day>...</day>, <step>...</step>, <shop>...</shop>, <container>...</container>).
- Do NOT emit any text outside the <plan>...</plan> block.
- Do NOT wrap the output in markdown code fences.`

export function buildUserPrompt(
  profile: TrainingProfile,
  preferences: DietaryPreferences
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

  const mealsPerDay = 4
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

PER-MEAL BUDGET (${mealsPerDay} meals/day — aim for these per meal):
- Training: ~${tPerMeal.calories} cal | ~${tPerMeal.protein_g}g P | ~${tPerMeal.carbs_g}g C | ~${tPerMeal.fat_g}g F
- Rest: ~${rPerMeal.calories} cal | ~${rPerMeal.protein_g}g P | ~${rPerMeal.carbs_g}g C | ~${rPerMeal.fat_g}g F

PREFERENCES:
- Prep day: ${profile.prep_day}
- Containers to fill: ${profile.containers_per_week}
- Max prep session length: ${profile.max_prep_time_mins} minutes${dietBlock}${exclusionsBlock}

Return the plan using the <plan>...</plan> tag format from your instructions. No markdown, no prose, no JSON.`
}
