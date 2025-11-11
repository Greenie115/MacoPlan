/**
 * Test script to demonstrate macro calculation improvements
 *
 * User Example:
 * - 88kg male
 * - Very active (5 gym sessions per week)
 * - Advanced lifter
 * - Goal: Build muscle (bulk)
 *
 * User's actual macros: 330g carbs, 180g protein, 80g fat
 */

import { calculateBMR } from './lib/calculations/bmr'
import { calculateTDEE } from './lib/calculations/tdee'
import { calculateTargetCalories, calculateMacros } from './lib/calculations/macros'

// User's stats
const weight = 88 // kg
const heightInches = 70 // ~178cm
const age = 30 // assumed
const sex = 'male'
const activityLevel = 'very' // 5 gym sessions per week
const goal = 'bulk'
const experienceLevel = 'advanced'

console.log('='.repeat(60))
console.log('MACRO CALCULATION IMPROVEMENTS - TEST RESULTS')
console.log('='.repeat(60))
console.log()

console.log('User Stats:')
console.log(`- Weight: ${weight}kg (${(weight * 2.20462).toFixed(1)} lbs)`)
console.log(`- Sex: ${sex}`)
console.log(`- Activity Level: ${activityLevel} (5 gym sessions/week)`)
console.log(`- Experience: ${experienceLevel} lifter`)
console.log(`- Goal: ${goal} (build muscle)`)
console.log()

// Calculate BMR and TDEE
const bmr = calculateBMR(weight, heightInches, age, sex, 'metric')
const tdee = calculateTDEE(bmr, activityLevel)
const targetCalories = calculateTargetCalories(tdee, goal)

console.log('Energy Expenditure:')
console.log(`- BMR: ${Math.round(bmr)} calories/day`)
console.log(`- TDEE: ${tdee} calories/day`)
console.log(`- Target (10% surplus): ${targetCalories} calories/day`)
console.log()

// OLD CALCULATION (without experience/activity parameters)
console.log('OLD CALCULATION (Before Fix):')
console.log('-'.repeat(60))
const weightLbs = weight * 2.20462
const oldProtein = Math.round(weightLbs * 0.8) // Fixed 0.8g/lb for bulk
const oldFat = Math.round((targetCalories * 0.25) / 9) // 25% of calories
const oldCarbs = Math.round((targetCalories - (oldProtein * 4) - (oldFat * 9)) / 4)

console.log(`Protein: ${oldProtein}g (${oldProtein * 4} calories)`)
console.log(`  Logic: ${weightLbs.toFixed(1)} lbs × 0.8g/lb (fixed)`)
console.log()
console.log(`Fat: ${oldFat}g (${oldFat * 9} calories)`)
console.log(`  Logic: ${targetCalories} cal × 25% / 9`)
console.log()
console.log(`Carbs: ${oldCarbs}g (${oldCarbs * 4} calories)`)
console.log(`  Logic: Remaining calories`)
console.log()
console.log(`Total: ${oldProtein * 4 + oldFat * 9 + oldCarbs * 4} calories`)
console.log()

// NEW CALCULATION (with evidence-based ISSN parameters)
console.log('NEW CALCULATION (Evidence-Based ISSN):')
console.log('-'.repeat(60))
const newMacros = calculateMacros(
  targetCalories,
  goal,
  weight,
  'kg',
  activityLevel
)

console.log(`Protein: ${newMacros.protein}g (${newMacros.protein * 4} calories)`)
console.log(`  Logic: ${weight}kg × 1.8 g/kg (ISSN: bulk + very active = 1.8 g/kg)`)
console.log()
console.log(`Fat: ${newMacros.fat}g (${newMacros.fat * 9} calories)`)
console.log(`  Logic: ${targetCalories} cal × 20% / 9 (bulk + very active), min ${Math.round(weight * 0.5)}g (hormone health)`)
console.log()
console.log(`Carbs: ${newMacros.carbs}g (${newMacros.carbs * 4} calories)`)
console.log(`  Logic: Remaining calories (prioritize performance fuel)`)
console.log()
console.log(`Total: ${newMacros.protein * 4 + newMacros.fat * 9 + newMacros.carbs * 4} calories`)
console.log()

// USER'S ACTUAL MACROS
console.log('USER\'S ACTUAL MACROS (Real-World):')
console.log('-'.repeat(60))
const userProtein = 180
const userCarbs = 330
const userFat = 80
const userTotal = userProtein * 4 + userCarbs * 4 + userFat * 9

console.log(`Protein: ${userProtein}g (${userProtein * 4} calories)`)
console.log(`Carbs: ${userCarbs}g (${userCarbs * 4} calories)`)
console.log(`Fat: ${userFat}g (${userFat * 9} calories)`)
console.log(`Total: ${userTotal} calories`)
console.log()

// COMPARISON
console.log('COMPARISON:')
console.log('='.repeat(60))
console.log()
console.log('Protein:')
console.log(`  Old: ${oldProtein}g | New: ${newMacros.protein}g | User's Actual: ${userProtein}g`)
console.log(`  Old vs User: ${oldProtein - userProtein}g (${((oldProtein / userProtein - 1) * 100).toFixed(1)}% off)`)
console.log(`  New vs User: ${newMacros.protein - userProtein}g (${((newMacros.protein / userProtein - 1) * 100).toFixed(1)}% off)`)
console.log()
console.log('Carbs:')
console.log(`  Old: ${oldCarbs}g | New: ${newMacros.carbs}g | User's Actual: ${userCarbs}g`)
console.log(`  Old vs User: ${oldCarbs - userCarbs}g (${((oldCarbs / userCarbs - 1) * 100).toFixed(1)}% off)`)
console.log(`  New vs User: ${newMacros.carbs - userCarbs}g (${((newMacros.carbs / userCarbs - 1) * 100).toFixed(1)}% off)`)
console.log()
console.log('Fat:')
console.log(`  Old: ${oldFat}g | New: ${newMacros.fat}g | User's Actual: ${userFat}g`)
console.log(`  Old vs User: ${oldFat - userFat}g (${((oldFat / userFat - 1) * 100).toFixed(1)}% off)`)
console.log(`  New vs User: ${newMacros.fat - userFat}g (${((newMacros.fat / userFat - 1) * 100).toFixed(1)}% off)`)
console.log()

// IMPROVEMENT SUMMARY
console.log('IMPROVEMENT SUMMARY:')
console.log('='.repeat(60))
console.log()
console.log('Key Changes in Evidence-Based Calculation:')
console.log('1. ISSN Protein Recommendations:')
console.log('   - Bulk (moderate): 1.6 g/kg')
console.log('   - Bulk (very active): 1.8 g/kg')
console.log('   - Cut (moderate): 2.2 g/kg')
console.log('   - Cut (very active): 2.4 g/kg')
console.log()
console.log('2. Activity-Adjusted Fat Distribution:')
console.log('   - Very/Extremely active bulk: 20% of calories')
console.log('   - Moderate activity bulk: 25% of calories')
console.log('   - Minimum: 0.5 g/kg for hormone production')
console.log()
console.log('3. Research-Based Approach:')
console.log('   - OLD: Experience level determined protein (not evidence-based)')
console.log('   - NEW: Activity level + goal determine protein (ISSN standard)')
console.log('   - Removed experienceLevel parameter (research shows it doesn\'t affect protein needs)')
console.log()
console.log('Result: Macros now align with International Society of Sports Nutrition')
console.log('        Position Stand (gold standard for evidence-based recommendations).')
console.log()
