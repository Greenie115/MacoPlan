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
