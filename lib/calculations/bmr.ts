/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * More accurate than Harris-Benedict for modern populations
 *
 * @param weight - Weight in lbs or kg
 * @param heightInches - Total height in inches
 * @param age - Age in years
 * @param sex - Biological sex ('male' or 'female')
 * @param unit - Weight unit ('imperial' or 'metric')
 * @returns BMR in calories per day
 */
export function calculateBMR(
  weight: number,
  heightInches: number,
  age: number,
  sex: 'male' | 'female',
  unit: 'imperial' | 'metric' = 'imperial'
): number {
  let weightKg: number
  let heightCm: number

  if (unit === 'imperial') {
    weightKg = weight * 0.453592 // lbs to kg
    heightCm = heightInches * 2.54 // inches to cm
  } else {
    weightKg = weight
    heightCm = heightInches
  }

  // Mifflin-St Jeor Equation: BMR = 10W + 6.25H - 5A + S
  // Where W = weight in kg, H = height in cm, A = age in years
  // S = +5 for males, -161 for females
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age

  // Sex adjustment
  return sex === 'male' ? baseBMR + 5 : baseBMR - 161
}
