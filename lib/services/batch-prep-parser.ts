import {
  BatchPrepPlanSchema,
  BatchPrepValidationError,
  type BatchPrepPlan,
  type DayPlan,
  type Meal,
} from '@/lib/types/batch-prep'

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function extractAttrs(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /(\w+)\s*=\s*"([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(attrString)) !== null) {
    attrs[m[1]] = decodeEntities(m[2])
  }
  return attrs
}

function toNum(s: string | undefined, fallback = 0): number {
  if (s === undefined || s === '') return fallback
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : fallback
}

function toInt(s: string | undefined, fallback = 0): number {
  return Math.round(toNum(s, fallback))
}

function parseMeal(body: string, attrs: Record<string, string>): Meal {
  const nameMatch = body.match(/<name>([\s\S]*?)<\/name>/)
  const name = nameMatch ? decodeEntities(nameMatch[1].trim()) : 'Unnamed meal'

  const ingredients: Meal['ingredients'] = []
  const ingRe = /<ing\s+([^>]*?)\/>/g
  let m: RegExpExecArray | null
  while ((m = ingRe.exec(body)) !== null) {
    const a = extractAttrs(m[1])
    if (!a.name) continue
    ingredients.push({
      name: a.name,
      quantity_g: toNum(a.g),
      macros: {
        calories: toNum(a.cal),
        protein_g: toNum(a.p),
        carbs_g: toNum(a.c),
        fat_g: toNum(a.f),
      },
    })
  }

  return {
    name,
    meal_slot: (attrs.slot as Meal['meal_slot']) ?? 'lunch',
    ingredients,
    total_macros: {
      calories: toNum(attrs.cal),
      protein_g: toNum(attrs.p),
      carbs_g: toNum(attrs.c),
      fat_g: toNum(attrs.f),
    },
    equipment: (attrs.equipment as Meal['equipment']) ?? 'none',
    servings_to_prep: toInt(attrs.servings, 1),
    storage_days: toInt(attrs.storage_days, 5),
  }
}

function parseDay(body: string, attrs: Record<string, string>): DayPlan {
  const meals: Meal[] = []
  const mealRe = /<meal\s+([^>]+)>([\s\S]*?)<\/meal>/g
  let m: RegExpExecArray | null
  while ((m = mealRe.exec(body)) !== null) {
    meals.push(parseMeal(m[2], extractAttrs(m[1])))
  }
  return {
    meals,
    daily_totals: {
      calories: toNum(attrs.cal),
      protein_g: toNum(attrs.p),
      carbs_g: toNum(attrs.c),
      fat_g: toNum(attrs.f),
    },
  }
}

export function parseBatchPrepPlan(text: string): BatchPrepPlan {
  const planMatch = text.match(/<plan\s+([^>]*)>/)
  const planAttrs = planMatch ? extractAttrs(planMatch[1]) : {}

  let trainingDay: DayPlan | null = null
  let restDay: DayPlan | null = null
  const dayRe = /<day\s+([^>]+)>([\s\S]*?)<\/day>/g
  let m: RegExpExecArray | null
  while ((m = dayRe.exec(text)) !== null) {
    const attrs = extractAttrs(m[1])
    const day = parseDay(m[2], attrs)
    if (attrs.type === 'training') trainingDay = day
    else if (attrs.type === 'rest') restDay = day
  }

  if (!trainingDay || !restDay) {
    throw new BatchPrepValidationError(
      `Missing <day> blocks: training=${!!trainingDay} rest=${!!restDay}`
    )
  }

  const prep_timeline: BatchPrepPlan['prep_timeline'] = []
  const stepRe = /<step\s+([^>]+)>([\s\S]*?)<\/step>/g
  while ((m = stepRe.exec(text)) !== null) {
    const a = extractAttrs(m[1])
    prep_timeline.push({
      step: toInt(a.n),
      time: a.time || '0:00',
      action: decodeEntities(m[2].trim()),
      duration_mins: toInt(a.duration),
      equipment: (a.equipment as BatchPrepPlan['prep_timeline'][number]['equipment']) ?? 'none',
    })
  }

  const shopping_list: BatchPrepPlan['shopping_list'] = []
  const shopRe = /<shop\s+([^>]+)>([\s\S]*?)<\/shop>/g
  while ((m = shopRe.exec(text)) !== null) {
    const a = extractAttrs(m[1])
    shopping_list.push({
      ingredient: decodeEntities(m[2].trim()),
      quantity_g: toNum(a.g),
      category: a.category,
    })
  }

  const container_assignments: BatchPrepPlan['container_assignments'] = []
  const containerRe = /<container\s+([^>]+)>([\s\S]*?)<\/container>/g
  while ((m = containerRe.exec(text)) !== null) {
    const a = extractAttrs(m[1])
    container_assignments.push({
      container_num: toInt(a.n),
      day_type: (a.day as 'training' | 'rest') ?? 'training',
      meal_slot: (a.slot as Meal['meal_slot']) ?? 'lunch',
      recipe_name: decodeEntities(m[2].trim()),
    })
  }

  const candidate = {
    training_day: trainingDay,
    rest_day: restDay,
    prep_timeline,
    shopping_list,
    container_assignments,
    total_containers: toInt(
      planAttrs.total_containers,
      container_assignments.length || 1
    ),
    estimated_prep_time_mins: toInt(planAttrs.prep_time_mins, 60),
  }

  try {
    return BatchPrepPlanSchema.parse(candidate)
  } catch (err) {
    throw new BatchPrepValidationError(
      `Parsed plan failed Zod validation: ${(err as Error).message}`,
      err
    )
  }
}
