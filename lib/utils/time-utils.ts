export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}

export function getGreeting(userName?: string): string {
  const timeOfDay = getTimeOfDay()
  const greetingMap = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
  }

  const baseGreeting = greetingMap[timeOfDay]
  return userName ? `${baseGreeting}, ${userName}!` : `${baseGreeting}!`
}

/**
 * One-line coach note under the dashboard greeting, driven by today's
 * protein progress. Returns null when there's nothing worth saying.
 */
export function getGreetingSubline(
  proteinTarget: number,
  proteinEaten: number,
  mealsLogged: number
): string | null {
  if (proteinTarget <= 0) return null

  const left = Math.round(proteinTarget - proteinEaten)

  if (mealsLogged === 0) {
    return getTimeOfDay() === 'evening'
      ? `Nothing logged yet — still time to get your protein in.`
      : `Full day ahead — ${proteinTarget}g protein on the plan.`
  }
  if (left <= 0) {
    return 'Protein target hit — day won. 💪'
  }
  if (left <= 30) {
    return `${left}g protein to go — one more meal closes it out.`
  }
  return `${left}g protein left today. Keep stacking.`
}
