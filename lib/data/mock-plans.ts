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
  },
]
