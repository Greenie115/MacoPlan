import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to get a recipe ID by name
async function getRecipeId(name: string) {
  const { data } = await supabase
    .from('recipes')
    .select('id')
    .ilike('name', `%${name}%`)
    .limit(1)
    .single()
  return data?.id
}

const PLAN_DATA = {
  title: '7-Day Muscle Building Plan',
  date_range: 'Nov 5-11, 2025',
  target_calories: 2450,
  target_protein: 180,
  target_carbs: 280,
  target_fat: 68,
  days: [
    {
      day_of_week: 'Mon',
      date: '2025-11-05',
      meals: [
        { name: 'Greek Yogurt Power Bowl', type: 'breakfast', calories: 550, protein: 35, carbs: 60, fat: 12, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80' },
        { name: 'Grilled Chicken Salad', type: 'lunch', calories: 750, protein: 55, carbs: 40, fat: 25, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
        { name: 'Salmon with Asparagus', type: 'dinner', calories: 800, protein: 60, carbs: 120, fat: 20, image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80' },
        { name: 'Protein Shake', type: 'snack', calories: 350, protein: 30, carbs: 60, fat: 8, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Tue',
      date: '2025-11-06',
      meals: [
        { name: 'Oatmeal with Peanut Butter', type: 'breakfast', calories: 450, protein: 15, carbs: 65, fat: 18, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80' },
        { name: 'Turkey & Cheese Wrap', type: 'lunch', calories: 420, protein: 35, carbs: 30, fat: 15, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
        { name: 'Beef Stir-Fry', type: 'dinner', calories: 500, protein: 40, carbs: 20, fat: 25, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Cottage Cheese with Pineapple', type: 'snack', calories: 180, protein: 25, carbs: 15, fat: 2, image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Wed',
      date: '2025-11-07',
      meals: [
        { name: 'Avocado Toast with Poached Egg', type: 'breakfast', calories: 380, protein: 18, carbs: 35, fat: 22, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80' },
        { name: 'Quinoa & Black Bean Salad', type: 'lunch', calories: 350, protein: 12, carbs: 55, fat: 10, image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80' },
        { name: 'Baked Cod with Roasted Veggies', type: 'dinner', calories: 320, protein: 30, carbs: 15, fat: 10, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
        { name: 'Hard Boiled Eggs & Almonds', type: 'snack', calories: 220, protein: 14, carbs: 4, fat: 16, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Thu',
      date: '2025-11-08',
      meals: [
        { name: 'Greek Yogurt Power Bowl', type: 'breakfast', calories: 550, protein: 35, carbs: 60, fat: 12, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80' },
        { name: 'Turkey Chili', type: 'lunch', calories: 450, protein: 35, carbs: 40, fat: 12, image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=800&q=80' },
        { name: 'Grilled Chicken Salad', type: 'dinner', calories: 750, protein: 55, carbs: 40, fat: 25, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
        { name: 'Apple Slices with Almond Butter', type: 'snack', calories: 200, protein: 5, carbs: 25, fat: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Fri',
      date: '2025-11-09',
      meals: [
        { name: 'Oatmeal with Peanut Butter', type: 'breakfast', calories: 450, protein: 15, carbs: 65, fat: 18, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80' },
        { name: 'Beef Stir-Fry', type: 'lunch', calories: 500, protein: 40, carbs: 20, fat: 25, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },
        { name: 'Salmon with Asparagus', type: 'dinner', calories: 800, protein: 60, carbs: 120, fat: 20, image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80' },
        { name: 'Protein Shake', type: 'snack', calories: 350, protein: 30, carbs: 60, fat: 8, image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Sat',
      date: '2025-11-10',
      meals: [
        { name: 'Avocado Toast with Poached Egg', type: 'breakfast', calories: 380, protein: 18, carbs: 35, fat: 22, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80' },
        { name: 'Turkey & Cheese Wrap', type: 'lunch', calories: 420, protein: 35, carbs: 30, fat: 15, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80' },
        { name: 'Turkey Chili', type: 'dinner', calories: 450, protein: 35, carbs: 40, fat: 12, image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=800&q=80' },
        { name: 'Cottage Cheese with Pineapple', type: 'snack', calories: 180, protein: 25, carbs: 15, fat: 2, image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      day_of_week: 'Sun',
      date: '2025-11-11',
      meals: [
        { name: 'Greek Yogurt Power Bowl', type: 'breakfast', calories: 550, protein: 35, carbs: 60, fat: 12, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80' },
        { name: 'Quinoa & Black Bean Salad', type: 'lunch', calories: 350, protein: 12, carbs: 55, fat: 10, image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80' },
        { name: 'Baked Cod with Roasted Veggies', type: 'dinner', calories: 320, protein: 30, carbs: 15, fat: 10, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
        { name: 'Hard Boiled Eggs & Almonds', type: 'snack', calories: 220, protein: 14, carbs: 4, fat: 16, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80' },
      ]
    }
  ]
}

async function seedPlans() {
  console.log('Starting plan seed...')

  // 1. Get a test user (or create one if needed, but for now we'll assume the first user in auth.users)
  // NOTE: In a real scenario, we'd want to be specific. For this test, we'll try to find *any* user.
  // Since we can't easily list users with service role without admin API, we might need to rely on the user being logged in or just create a dummy UUID if we disable FK constraints (not recommended).
  // BETTER APPROACH: Use a specific known UUID or just insert for the currently logged in user context if we were running in browser.
  // FOR NOW: We will try to get the first user from the `auth.users` table if possible, or fail if no user exists.
  // Actually, we can't select from auth.users easily. 
  // Let's assume a hardcoded User ID for testing or ask the developer to provide one.
  // OR, we can just insert with a specific UUID if we had one.
  
  // WORKAROUND: We will fetch the first user ID from the `profiles` table if it exists (assuming we have one), or `plans` table if any exist.
  // If not, we'll error out and ask to run this after signing up.
  
  // Let's try to just use a placeholder UUID that we know exists, OR we can't really seed a plan without a user.
  // I'll fetch the most recent user from `auth.users` using the admin api if available, but `supabase-js` client here is standard.
  
  // Let's try to get a user from the public `profiles` table if you have one? No `profiles` table mentioned in context.
  // I will use a hardcoded UUID for now and the user might need to update it, OR I can try to create a dummy user.
  // Actually, I'll just check if there are any users.
  
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  
  let userId: string

  if (userError || !users || users.length === 0) {
    console.log('No users found. Creating a test user...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'testuser@macoplan.com',
      password: 'password123',
      email_confirm: true
    })
    
    if (createError || !newUser.user) {
      console.error('Error creating test user:', createError)
      return
    }
    userId = newUser.user.id
    console.log(`Created test user: ${userId}`)
  } else {
    userId = users[0].id
    console.log(`Seeding plan for user: ${userId}`)
  }

  // 2. Create the Plan
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      title: PLAN_DATA.title,
      date_range: PLAN_DATA.date_range,
      target_calories: PLAN_DATA.target_calories,
      target_protein: PLAN_DATA.target_protein,
      target_carbs: PLAN_DATA.target_carbs,
      target_fat: PLAN_DATA.target_fat
    })
    .select()
    .single()

  if (planError) {
    console.error('Error creating plan:', planError)
    return
  }

  console.log(`Created plan: ${plan.id}`)

  // 3. Create Days and Meals
  for (let i = 0; i < PLAN_DATA.days.length; i++) {
    const dayData = PLAN_DATA.days[i]
    
    // Calculate totals for the day
    const totalCalories = dayData.meals.reduce((sum, m) => sum + m.calories, 0)
    const totalProtein = dayData.meals.reduce((sum, m) => sum + m.protein, 0)
    const totalCarbs = dayData.meals.reduce((sum, m) => sum + m.carbs, 0)
    const totalFat = dayData.meals.reduce((sum, m) => sum + m.fat, 0)

    const { data: day, error: dayError } = await supabase
      .from('plan_days')
      .insert({
        plan_id: plan.id,
        date: dayData.date,
        day_of_week: dayData.day_of_week,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fat: totalFat,
        order_index: i
      })
      .select()
      .single()

    if (dayError) {
      console.error(`Error creating day ${dayData.day_of_week}:`, dayError)
      continue
    }

    // Create Meals
    for (let j = 0; j < dayData.meals.length; j++) {
      const mealData = dayData.meals[j]
      const recipeId = await getRecipeId(mealData.name)

      const { error: mealError } = await supabase
        .from('plan_meals')
        .insert({
          plan_day_id: day.id,
          recipe_id: recipeId,
          name: mealData.name,
          type: mealData.type,
          calories: mealData.calories,
          protein_grams: mealData.protein,
          carb_grams: mealData.carbs,
          fat_grams: mealData.fat,
          image_url: mealData.image,
          order_index: j
        })

      if (mealError) {
        console.error(`Error creating meal ${mealData.name}:`, mealError)
      }
    }
  }

  console.log('Plan seeding complete!')
}

seedPlans()
