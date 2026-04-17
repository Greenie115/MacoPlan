import { unsplashService, type UnsplashPhoto } from '@/lib/services/unsplash'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function getImagesForMealNames(
  mealNames: string[]
): Promise<Map<string, UnsplashPhoto>> {
  const unique = Array.from(new Set(mealNames.filter((n) => n && n.trim())))
  if (unique.length === 0) return new Map()

  if (!process.env.UNSPLASH_ACCESS_KEY) return new Map()

  const recipes = unique.map((name) => ({
    id: `meal:${slugify(name)}`,
    name,
  }))

  try {
    const byId = await unsplashService.getImagesForRecipes(recipes)
    const byName = new Map<string, UnsplashPhoto>()
    for (const { id, name } of recipes) {
      const photo = byId.get(id)
      if (photo) byName.set(name, photo)
    }
    return byName
  } catch (err) {
    console.error('[batch-prep] image fetch failed:', err)
    return new Map()
  }
}
