import type { TrainingProfile, DietaryPreferences } from '@/lib/types/batch-prep'

export const BATCH_PREP_SYSTEM_PROMPT = `You are a meal prep planning engine for bodybuilders and strength athletes. You generate BATCH COOKING plans, not daily meal plans.

HARD RULES:
1. Output MUST be valid JSON matching the schema below — no prose, no markdown fences, no code blocks.
2. Generate 3–4 distinct recipes total. Each recipe is cooked ONCE and portioned into multiple containers across the week.
3. Every ingredient MUST have a gram weight. Never use "1 cup", "a handful", or "to taste".
4. Recipes must be batch-cookable: refrigeratable for 5 days minimum, bulk-scalable.
5. Maximise ingredient overlap between recipes (e.g. chicken thighs in 2 recipes, rice in 3 recipes) to shrink the shopping list and reduce waste.
6. Cooking instructions MUST be in PREP ORDER (what goes in the oven first, what can cook in parallel), NOT meal order. Group by equipment priority: oven → rice_cooker → stovetop → none.
7. Assign each meal.equipment as exactly one of: "oven" | "rice_cooker" | "stovetop" | "none".
8. Training day daily_totals and rest day daily_totals MUST each be within 5% of the targets provided in the user prompt.
9. Spread protein 30–50g per meal; never concentrate 100g+ in a single sitting.
10. Respect dietary exclusions absolutely — no prohibited ingredients anywhere.

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

VERIFICATION STEP — before outputting JSON:
1. For each meal, multiply each ingredient's quantity_g by its per-gram macros to compute ingredient-level macros.
2. Sum all ingredient macros within each meal to get total_macros.
3. Sum all meal total_macros within each day to get daily_totals.
4. Compare daily_totals to the user's targets. If any macro is off by more than 5%, adjust portion sizes before outputting.

OUTPUT SCHEMA:
{
  "training_day": {
    "meals": [
      {
        "name": "string",
        "meal_slot": "breakfast|lunch|snack|dinner",
        "ingredients": [
          {"name": "string", "quantity_g": number, "macros": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}}
        ],
        "total_macros": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number},
        "equipment": "oven|rice_cooker|stovetop|none",
        "servings_to_prep": number,
        "storage_days": number
      }
    ],
    "daily_totals": {"calories": number, "protein_g": number, "carbs_g": number, "fat_g": number}
  },
  "rest_day": { /* same structure as training_day */ },
  "prep_timeline": [
    {
      "step": number,
      "time": "H:MM",
      "action": "string (imperative, specific)",
      "duration_mins": number,
      "equipment": "oven|rice_cooker|stovetop|none"
    }
  ],
  "shopping_list": [
    {"ingredient": "string", "quantity_g": number, "category": "protein|grain|vegetable|dairy|fat|other"}
  ],
  "container_assignments": [
    {"container_num": number, "day_type": "training|rest", "meal_slot": "breakfast|lunch|snack|dinner", "recipe_name": "string"}
  ],
  "total_containers": number,
  "estimated_prep_time_mins": number
}

Return ONLY the JSON object. No explanation. No markdown.`

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

Return the plan as a JSON object matching the schema in your instructions. No markdown, no prose.`
}
