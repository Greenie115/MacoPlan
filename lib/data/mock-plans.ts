import { Plan } from '@/lib/types/plan'

export const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    title: '7-Day Muscle Building Plan',
    dateRange: 'Nov 5-11, 2025',
    calories: 2450,
    macros: {
      protein: 180,
      carbs: 280,
      fat: 68,
    },
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=300&q=80',
    ],
    days: [
      {
        date: 'Nov 5',
        dayOfWeek: 'Mon',
        calories: 2450,
        macros: { protein: 180, carbs: 280, fat: 65 },
        meals: [
          {
            id: 'm1',
            name: 'Greek Yogurt Power Bowl',
            type: 'breakfast',
            calories: 550,
            macros: { protein: 35, carbs: 60, fat: 12 },
            image: 'https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'm2',
            name: 'Grilled Chicken Salad',
            type: 'lunch',
            calories: 750,
            macros: { protein: 55, carbs: 40, fat: 25 },
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'm3',
            name: 'Salmon with Asparagus',
            type: 'dinner',
            calories: 800,
            macros: { protein: 60, carbs: 120, fat: 20 },
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'm4',
            name: 'Protein Shake',
            type: 'snack',
            calories: 350,
            macros: { protein: 30, carbs: 60, fat: 8 },
            image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
      {
        date: 'Nov 6',
        dayOfWeek: 'Tue',
        calories: 2400,
        macros: { protein: 175, carbs: 270, fat: 65 },
        meals: [
          {
            id: 'm5',
            name: 'Oatmeal with Peanut Butter',
            type: 'breakfast',
            calories: 450,
            macros: { protein: 15, carbs: 65, fat: 18 },
            image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'm6',
            name: 'Turkey & Cheese Wrap',
            type: 'lunch',
            calories: 420,
            macros: { protein: 35, carbs: 30, fat: 15 },
            image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'm7',
            name: 'Beef Stir-Fry',
            type: 'dinner',
            calories: 500,
            macros: { protein: 40, carbs: 20, fat: 25 },
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'High-Protein Shred',
    dateRange: 'Oct 29 - Nov 4, 2025',
    calories: 2100,
    macros: {
      protein: 200,
      carbs: 150,
      fat: 70,
    },
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=300&q=80',
    ],
    days: [
       {
        date: 'Oct 29',
        dayOfWeek: 'Mon',
        calories: 2100,
        macros: { protein: 200, carbs: 150, fat: 70 },
        meals: [
          {
            id: 'm8',
            name: 'Egg White Omelet',
            type: 'breakfast',
            calories: 350,
            macros: { protein: 30, carbs: 5, fat: 10 },
            image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80',
          },
        ]
       }
    ]
  },
  {
    id: '3',
    title: 'Bulking Phase Week 3',
    dateRange: 'Oct 15-21, 2025',
    calories: 3200,
    macros: {
      protein: 190,
      carbs: 400,
      fat: 85,
    },
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=80',
    ],
    days: []
  },
]
