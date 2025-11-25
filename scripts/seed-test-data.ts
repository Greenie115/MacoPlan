import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials (SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const TEST_RECIPES = [
  {
    name: 'Greek Yogurt Power Bowl',
    description: 'A high-protein breakfast bowl with fresh berries and honey.',
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    calories: 550,
    protein_grams: 35,
    carb_grams: 60,
    fat_grams: 12,
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    total_time_minutes: 5,
    servings: 1,
    difficulty: 'easy',
    tags: ['breakfast', 'high-protein', 'vegetarian', 'gluten-free', 'quick'],
    ingredients: [
      { ingredient: 'Greek Yogurt', amount: '1', unit: 'cup' },
      { ingredient: 'Mixed Berries', amount: '1/2', unit: 'cup' },
      { ingredient: 'Honey', amount: '1', unit: 'tbsp' },
      { ingredient: 'Granola', amount: '1/4', unit: 'cup' },
    ],
    instructions: [
      { step: 1, text: 'Add Greek yogurt to a bowl.' },
      { step: 2, text: 'Top with mixed berries and granola.' },
      { step: 3, text: 'Drizzle with honey and serve.' },
    ]
  },
  {
    name: 'Grilled Chicken Salad',
    description: 'Fresh and healthy salad with grilled chicken breast.',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    calories: 750,
    protein_grams: 55,
    carb_grams: 40,
    fat_grams: 25,
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    total_time_minutes: 25,
    servings: 1,
    difficulty: 'easy',
    tags: ['lunch', 'high-protein', 'low-carb', 'healthy'],
    ingredients: [
      { ingredient: 'Chicken Breast', amount: '6', unit: 'oz' },
      { ingredient: 'Mixed Greens', amount: '2', unit: 'cups' },
      { ingredient: 'Cherry Tomatoes', amount: '1/2', unit: 'cup' },
      { ingredient: 'Avocado', amount: '1/2', unit: 'fruit' },
      { ingredient: 'Olive Oil', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Season chicken breast with salt and pepper.' },
      { step: 2, text: 'Grill chicken for 5-6 minutes per side until cooked through.' },
      { step: 3, text: 'Toss greens with tomatoes and olive oil.' },
      { step: 4, text: 'Slice chicken and avocado, place on top of salad.' },
    ]
  },
  {
    name: 'Salmon with Asparagus',
    description: 'Omega-3 rich dinner with roasted vegetables.',
    image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=800&q=80',
    calories: 800,
    protein_grams: 60,
    carb_grams: 120, // High due to side (e.g. quinoa/rice not listed but implied by macros in design)
    fat_grams: 20,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    total_time_minutes: 30,
    servings: 1,
    difficulty: 'medium',
    tags: ['dinner', 'high-protein', 'healthy', 'gluten-free'],
    ingredients: [
      { ingredient: 'Salmon Fillet', amount: '6', unit: 'oz' },
      { ingredient: 'Asparagus', amount: '1', unit: 'bunch' },
      { ingredient: 'Lemon', amount: '1', unit: 'fruit' },
      { ingredient: 'Quinoa', amount: '1', unit: 'cup' },
    ],
    instructions: [
      { step: 1, text: 'Preheat oven to 400°F (200°C).' },
      { step: 2, text: 'Place salmon and asparagus on a baking sheet.' },
      { step: 3, text: 'Season with lemon juice, salt, and pepper.' },
      { step: 4, text: 'Bake for 15-20 minutes.' },
      { step: 5, text: 'Serve with cooked quinoa.' },
    ]
  },
  {
    name: 'Protein Shake',
    description: 'Quick post-workout recovery shake.',
    image_url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    calories: 350,
    protein_grams: 30,
    carb_grams: 60,
    fat_grams: 8,
    prep_time_minutes: 2,
    cook_time_minutes: 0,
    total_time_minutes: 2,
    servings: 1,
    difficulty: 'easy',
    tags: ['snack', 'high-protein', 'quick', 'liquid'],
    ingredients: [
      { ingredient: 'Protein Powder', amount: '1', unit: 'scoop' },
      { ingredient: 'Banana', amount: '1', unit: 'fruit' },
      { ingredient: 'Almond Milk', amount: '1', unit: 'cup' },
      { ingredient: 'Peanut Butter', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Add all ingredients to a blender.' },
      { step: 2, text: 'Blend until smooth.' },
      { step: 3, text: 'Pour into a glass and enjoy.' },
    ]
  },
  // New Recipes
  {
    name: 'Oatmeal with Peanut Butter & Banana',
    description: 'Hearty breakfast to fuel your morning.',
    image_url: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
    calories: 450,
    protein_grams: 15,
    carb_grams: 65,
    fat_grams: 18,
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    total_time_minutes: 15,
    servings: 1,
    difficulty: 'easy',
    tags: ['breakfast', 'vegetarian', 'high-fiber'],
    ingredients: [
      { ingredient: 'Rolled Oats', amount: '1/2', unit: 'cup' },
      { ingredient: 'Banana', amount: '1', unit: 'fruit' },
      { ingredient: 'Peanut Butter', amount: '1', unit: 'tbsp' },
      { ingredient: 'Almond Milk', amount: '1', unit: 'cup' },
    ],
    instructions: [
      { step: 1, text: 'Cook oats with almond milk.' },
      { step: 2, text: 'Slice banana.' },
      { step: 3, text: 'Top oats with banana and peanut butter.' },
    ]
  },
  {
    name: 'Avocado Toast with Poached Egg',
    description: 'Classic brunch favorite with healthy fats and protein.',
    image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80',
    calories: 380,
    protein_grams: 18,
    carb_grams: 35,
    fat_grams: 22,
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    total_time_minutes: 10,
    servings: 1,
    difficulty: 'medium',
    tags: ['breakfast', 'vegetarian', 'healthy'],
    ingredients: [
      { ingredient: 'Whole Grain Bread', amount: '2', unit: 'slices' },
      { ingredient: 'Avocado', amount: '1/2', unit: 'fruit' },
      { ingredient: 'Egg', amount: '1', unit: 'large' },
      { ingredient: 'Red Pepper Flakes', amount: '1', unit: 'pinch' },
    ],
    instructions: [
      { step: 1, text: 'Toast the bread.' },
      { step: 2, text: 'Mash avocado and spread on toast.' },
      { step: 3, text: 'Poach the egg and place on top.' },
      { step: 4, text: 'Sprinkle with red pepper flakes.' },
    ]
  },
  {
    name: 'Turkey & Cheese Wrap',
    description: 'Simple and satisfying lunch on the go.',
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    calories: 420,
    protein_grams: 35,
    carb_grams: 30,
    fat_grams: 15,
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    total_time_minutes: 10,
    servings: 1,
    difficulty: 'easy',
    tags: ['lunch', 'quick', 'high-protein'],
    ingredients: [
      { ingredient: 'Whole Wheat Tortilla', amount: '1', unit: 'large' },
      { ingredient: 'Turkey Breast', amount: '4', unit: 'oz' },
      { ingredient: 'Swiss Cheese', amount: '1', unit: 'slice' },
      { ingredient: 'Spinach', amount: '1', unit: 'cup' },
    ],
    instructions: [
      { step: 1, text: 'Lay out tortilla.' },
      { step: 2, text: 'Layer turkey, cheese, and spinach.' },
      { step: 3, text: 'Roll up tightly and slice in half.' },
    ]
  },
  {
    name: 'Quinoa & Black Bean Salad',
    description: 'Refreshing plant-based protein salad.',
    image_url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
    calories: 350,
    protein_grams: 12,
    carb_grams: 55,
    fat_grams: 10,
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    total_time_minutes: 15,
    servings: 1,
    difficulty: 'easy',
    tags: ['lunch', 'vegan', 'gluten-free'],
    ingredients: [
      { ingredient: 'Cooked Quinoa', amount: '1', unit: 'cup' },
      { ingredient: 'Black Beans', amount: '1/2', unit: 'cup' },
      { ingredient: 'Corn', amount: '1/4', unit: 'cup' },
      { ingredient: 'Lime Juice', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Combine quinoa, beans, and corn.' },
      { step: 2, text: 'Drizzle with lime juice and toss.' },
      { step: 3, text: 'Season with salt and cilantro.' },
    ]
  },
  {
    name: 'Beef Stir-Fry with Broccoli',
    description: 'Savory asian-inspired dinner.',
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    calories: 500,
    protein_grams: 40,
    carb_grams: 20,
    fat_grams: 25,
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    total_time_minutes: 25,
    servings: 1,
    difficulty: 'medium',
    tags: ['dinner', 'high-protein', 'low-carb'],
    ingredients: [
      { ingredient: 'Beef Strips', amount: '5', unit: 'oz' },
      { ingredient: 'Broccoli Florets', amount: '2', unit: 'cups' },
      { ingredient: 'Soy Sauce', amount: '2', unit: 'tbsp' },
      { ingredient: 'Ginger', amount: '1', unit: 'tsp' },
    ],
    instructions: [
      { step: 1, text: 'Stir-fry beef until browned.' },
      { step: 2, text: 'Add broccoli and splash of water.' },
      { step: 3, text: 'Add soy sauce and ginger, cook until tender.' },
    ]
  },
  {
    name: 'Baked Cod with Roasted Veggies',
    description: 'Light and lean dinner option.',
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    calories: 320,
    protein_grams: 30,
    carb_grams: 15,
    fat_grams: 10,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    total_time_minutes: 30,
    servings: 1,
    difficulty: 'easy',
    tags: ['dinner', 'low-carb', 'pescatarian'],
    ingredients: [
      { ingredient: 'Cod Fillet', amount: '6', unit: 'oz' },
      { ingredient: 'Zucchini', amount: '1', unit: 'cup' },
      { ingredient: 'Bell Pepper', amount: '1', unit: 'cup' },
      { ingredient: 'Lemon', amount: '1', unit: 'slice' },
    ],
    instructions: [
      { step: 1, text: 'Place fish and veggies on baking sheet.' },
      { step: 2, text: 'Season with herbs and lemon.' },
      { step: 3, text: 'Bake at 400°F for 20 minutes.' },
    ]
  },
  {
    name: 'Turkey Chili',
    description: 'Warm and comforting bowl of chili.',
    image_url: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=800&q=80',
    calories: 450,
    protein_grams: 35,
    carb_grams: 40,
    fat_grams: 12,
    prep_time_minutes: 15,
    cook_time_minutes: 45,
    total_time_minutes: 60,
    servings: 4,
    difficulty: 'medium',
    tags: ['dinner', 'high-protein', 'meal-prep'],
    ingredients: [
      { ingredient: 'Ground Turkey', amount: '1', unit: 'lb' },
      { ingredient: 'Kidney Beans', amount: '1', unit: 'can' },
      { ingredient: 'Diced Tomatoes', amount: '1', unit: 'can' },
      { ingredient: 'Chili Powder', amount: '2', unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Brown turkey in a pot.' },
      { step: 2, text: 'Add beans, tomatoes, and spices.' },
      { step: 3, text: 'Simmer for 45 minutes.' },
    ]
  },
  {
    name: 'Apple Slices with Almond Butter',
    description: 'Crunchy and creamy snack.',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    calories: 200,
    protein_grams: 5,
    carb_grams: 25,
    fat_grams: 10,
    prep_time_minutes: 2,
    cook_time_minutes: 0,
    total_time_minutes: 2,
    servings: 1,
    difficulty: 'easy',
    tags: ['snack', 'vegetarian', 'gluten-free'],
    ingredients: [
      { ingredient: 'Apple', amount: '1', unit: 'medium' },
      { ingredient: 'Almond Butter', amount: '1', unit: 'tbsp' },
    ],
    instructions: [
      { step: 1, text: 'Slice the apple.' },
      { step: 2, text: 'Dip in almond butter.' },
    ]
  },
  {
    name: 'Cottage Cheese with Pineapple',
    description: 'High protein sweet and savory snack.',
    image_url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    calories: 180,
    protein_grams: 25,
    carb_grams: 15,
    fat_grams: 2,
    prep_time_minutes: 2,
    cook_time_minutes: 0,
    total_time_minutes: 2,
    servings: 1,
    difficulty: 'easy',
    tags: ['snack', 'high-protein', 'vegetarian'],
    ingredients: [
      { ingredient: 'Cottage Cheese', amount: '1', unit: 'cup' },
      { ingredient: 'Pineapple Chunks', amount: '1/2', unit: 'cup' },
    ],
    instructions: [
      { step: 1, text: 'Serve cottage cheese in a bowl.' },
      { step: 2, text: 'Top with pineapple.' },
    ]
  },
  {
    name: 'Hard Boiled Eggs & Almonds',
    description: 'Simple protein-packed snack box.',
    image_url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80',
    calories: 220,
    protein_grams: 14,
    carb_grams: 4,
    fat_grams: 16,
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    total_time_minutes: 20,
    servings: 1,
    difficulty: 'easy',
    tags: ['snack', 'keto', 'gluten-free'],
    ingredients: [
      { ingredient: 'Eggs', amount: '2', unit: 'large' },
      { ingredient: 'Almonds', amount: '15', unit: 'nuts' },
    ],
    instructions: [
      { step: 1, text: 'Boil eggs for 10 minutes.' },
      { step: 2, text: 'Peel and serve with almonds.' },
    ]
  }
]

async function seedTestData() {
  console.log('Starting database seed...')

  for (const recipeData of TEST_RECIPES) {
    console.log(`Seeding: ${recipeData.name}`)

    // 1. Check if recipe exists
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('name', recipeData.name)
      .single()

    let recipeId = existingRecipe?.id
    let recipeError = null

    if (recipeId) {
      // Update existing
      const { error } = await supabase
        .from('recipes')
        .update({
          description: recipeData.description,
          image_url: recipeData.image_url,
          calories: recipeData.calories,
          protein_grams: recipeData.protein_grams,
          carb_grams: recipeData.carb_grams,
          fat_grams: recipeData.fat_grams,
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes,
          total_time_minutes: recipeData.total_time_minutes,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
        })
        .eq('id', recipeId)
      recipeError = error
    } else {
      // Insert new
      const { data: newRecipe, error } = await supabase
        .from('recipes')
        .insert({
          name: recipeData.name,
          description: recipeData.description,
          image_url: recipeData.image_url,
          calories: recipeData.calories,
          protein_grams: recipeData.protein_grams,
          carb_grams: recipeData.carb_grams,
          fat_grams: recipeData.fat_grams,
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes,
          total_time_minutes: recipeData.total_time_minutes,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
        })
        .select()
        .single()
      
      recipeId = newRecipe?.id
      recipeError = error
    }

    if (recipeError || !recipeId) {
      console.error(`Error upserting recipe ${recipeData.name}:`, recipeError)
      continue
    }

    // 2. Insert Tags
    if (recipeData.tags.length > 0) {
      // First delete existing tags to avoid duplicates if re-running
      await supabase.from('recipe_tags').delete().eq('recipe_id', recipeId)
      
      const tags = recipeData.tags.map(tag => ({
        recipe_id: recipeId,
        tag: tag
      }))
      
      const { error: tagError } = await supabase.from('recipe_tags').insert(tags)
      if (tagError) console.error(`Error inserting tags for ${recipeData.name}:`, tagError)
    }

    // 3. Insert Ingredients
    if (recipeData.ingredients.length > 0) {
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

      const ingredients = recipeData.ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        ingredient: ing.ingredient,
        amount: ing.amount,
        unit: ing.unit,
        order_index: index + 1
      }))

      const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingredients)
      if (ingError) console.error(`Error inserting ingredients for ${recipeData.name}:`, ingError)
    }

    // 4. Insert Instructions
    if (recipeData.instructions.length > 0) {
      await supabase.from('recipe_instructions').delete().eq('recipe_id', recipeId)

      const instructions = recipeData.instructions.map(inst => ({
        recipe_id: recipeId,
        step_number: inst.step,
        instruction: inst.text
      }))

      const { error: instError } = await supabase.from('recipe_instructions').insert(instructions)
      if (instError) console.error(`Error inserting instructions for ${recipeData.name}:`, instError)
    }
  }

  console.log('Seeding complete!')
}

seedTestData()
