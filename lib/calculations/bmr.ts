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
  // Input validation
  if (weight <= 0) {
    throw new Error('Weight must be greater than 0')
  }
  if (heightInches <= 0) {
    throw new Error('Height must be greater than 0')
  }
  if (age < 13 || age > 120) {
    throw new Error('Age must be between 13 and 120 years')
  }

  let weightKg: number
  let heightCm: number

  if (unit === 'imperial') {
    weightKg = weight * 0.453592 // lbs to kg
    heightCm = heightInches * 2.54 // inches to cm
  } else {
    weightKg = weight
    heightCm = heightInches
  }

  // Reasonable upper bounds to prevent absurd calculations
  const maxWeightKg = 500 * 0.453592 // 500 lbs in kg
  const maxHeightCm = 96 * 2.54 // 8 feet in cm

  if (weightKg > maxWeightKg) {
    throw new Error('Weight exceeds maximum allowed value (500 lbs / 227 kg)')
  }
  if (heightCm > maxHeightCm) {
    throw new Error('Height exceeds maximum allowed value (8 feet / 244 cm)')
  }

  // Mifflin-St Jeor Equation: BMR = 10W + 6.25H - 5A + S
  // Where W = weight in kg, H = height in cm, A = age in years
  // S = +5 for males, -161 for females
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age

  // Sex adjustment
  return sex === 'male' ? baseBMR + 5 : baseBMR - 161
}
