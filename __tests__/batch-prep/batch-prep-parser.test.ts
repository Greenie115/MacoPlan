import { describe, it, expect } from 'vitest'
import { parseBatchPrepPlan } from '@/lib/services/batch-prep-parser'
import { BatchPrepValidationError } from '@/lib/types/batch-prep'

const VALID_TAGS = `<plan total_containers="10" prep_time_mins="90">
<day type="training" cal="2600" p="200" c="280" f="70">
<meal slot="lunch" equipment="oven" servings="5" storage_days="5" cal="635" p="56" c="42" f="25">
<name>Chicken and Rice Bowl</name>
<ing name="chicken thigh" g="200" cal="440" p="52" c="0" f="25"/>
<ing name="white rice" g="150" cal="195" p="4" c="42" f="0"/>
</meal>
<meal slot="dinner" equipment="stovetop" servings="5" storage_days="5" cal="760" p="69" c="60" f="25">
<name>Ground Beef and Sweet Potato</name>
<ing name="lean ground beef" g="250" cal="500" p="65" c="0" f="25"/>
<ing name="sweet potato" g="300" cal="260" p="4" c="60" f="0"/>
</meal>
</day>
<day type="rest" cal="2300" p="200" c="200" f="70">
<meal slot="lunch" equipment="oven" servings="2" storage_days="5" cal="396" p="47" c="0" f="22">
<name>Chicken and Rice Bowl smaller</name>
<ing name="chicken thigh" g="180" cal="396" p="47" c="0" f="22"/>
</meal>
<meal slot="dinner" equipment="stovetop" servings="2" storage_days="5" cal="400" p="52" c="0" f="20">
<name>Ground Beef and Sweet Potato smaller</name>
<ing name="lean ground beef" g="200" cal="400" p="52" c="0" f="20"/>
</meal>
</day>
<step n="1" time="0:00" duration="5" equipment="oven">Preheat oven to 200C.</step>
<step n="2" time="0:05" duration="0" equipment="rice_cooker">Start rice cooker.</step>
<step n="3" time="0:10" duration="20" equipment="stovetop">Brown ground beef.</step>
<shop g="2000" category="protein">chicken thigh</shop>
<shop g="1500" category="grain">white rice</shop>
<shop g="2500" category="protein">lean ground beef</shop>
<container n="1" day="training" slot="lunch">Chicken and Rice Bowl</container>
<container n="2" day="training" slot="dinner">Ground Beef and Sweet Potato</container>
</plan>`

describe('parseBatchPrepPlan', () => {
  it('parses a well-formed tag response', () => {
    const plan = parseBatchPrepPlan(VALID_TAGS)
    expect(plan.total_containers).toBe(10)
    expect(plan.estimated_prep_time_mins).toBe(90)
    expect(plan.training_day.meals).toHaveLength(2)
    expect(plan.training_day.meals[0].name).toBe('Chicken and Rice Bowl')
    expect(plan.training_day.meals[0].ingredients).toHaveLength(2)
    expect(plan.training_day.meals[0].ingredients[0].quantity_g).toBe(200)
    expect(plan.training_day.daily_totals.calories).toBe(2600)
    expect(plan.rest_day.meals).toHaveLength(2)
    expect(plan.prep_timeline).toHaveLength(3)
    expect(plan.shopping_list).toHaveLength(3)
    expect(plan.container_assignments).toHaveLength(2)
  })

  it('ignores surrounding prose', () => {
    const text = `Sure! Here's your plan:\n\n${VALID_TAGS}\n\nLet me know if you want tweaks.`
    const plan = parseBatchPrepPlan(text)
    expect(plan.training_day.meals[0].name).toBe('Chicken and Rice Bowl')
  })

  it('strips markdown code fences if present', () => {
    const text = '```xml\n' + VALID_TAGS + '\n```'
    const plan = parseBatchPrepPlan(text)
    expect(plan.total_containers).toBe(10)
  })

  it('decodes HTML entities in content', () => {
    const withEntities = VALID_TAGS.replace(
      '<name>Chicken and Rice Bowl</name>',
      '<name>Chicken &amp; Rice Bowl</name>'
    )
    const plan = parseBatchPrepPlan(withEntities)
    expect(plan.training_day.meals[0].name).toBe('Chicken & Rice Bowl')
  })

  it('throws when training day is missing', () => {
    const broken = VALID_TAGS.replace(/<day type="training"[\s\S]*?<\/day>/, '')
    expect(() => parseBatchPrepPlan(broken)).toThrow(BatchPrepValidationError)
  })

  it('throws when rest day is missing', () => {
    const broken = VALID_TAGS.replace(/<day type="rest"[\s\S]*?<\/day>/, '')
    expect(() => parseBatchPrepPlan(broken)).toThrow(BatchPrepValidationError)
  })

  it('throws when there are no <plan> tags at all', () => {
    expect(() => parseBatchPrepPlan('hello world')).toThrow(BatchPrepValidationError)
  })

  it('defaults total_containers from container_assignments when plan attr is missing', () => {
    const noPlanAttr = VALID_TAGS.replace(
      '<plan total_containers="10" prep_time_mins="90">',
      '<plan prep_time_mins="90">'
    )
    const plan = parseBatchPrepPlan(noPlanAttr)
    expect(plan.total_containers).toBe(2)
  })
})
