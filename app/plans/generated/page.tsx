'use client'

import { ArrowLeft, MoreVertical, ClipboardList, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { macroColors } from '@/lib/design-tokens'
import { useState } from 'react'
import { PaywallModal } from '@/components/monetization/paywall-modal'

export default function GeneratedPlanPage() {
  const [showPaywall, setShowPaywall] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex h-[60px] items-center px-4 justify-between max-w-3xl mx-auto w-full">
          <Link href="/plans/generate" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="size-6 text-gray-900" />
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPaywall(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors"
            >
              <span className="text-lg">💾</span>
              Save
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="size-6 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Your 7-Day Meal Plan</h1>
          <p className="text-gray-500">Nov 5 - Nov 11, 2025</p>
        </header>

        {/* Daily Totals */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-lg font-bold text-gray-900">Daily Totals: 2,465 cal avg</p>
          <div className="flex items-center gap-4 pt-2 pb-1">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <span className="text-lg">{macroColors.protein.emoji}</span> 182g
            </span>
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <span className="text-lg">{macroColors.carbs.emoji}</span> 278g
            </span>
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <span className="text-lg">{macroColors.fat.emoji}</span> 69g
            </span>
          </div>
          <p className="text-green-600 text-sm font-medium">✅ Within your targets</p>
        </div>

        {/* Grocery List Button */}
        <button className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white text-primary font-bold hover:bg-primary/5 transition-colors">
          <ClipboardList className="size-5" />
          Generate Grocery List
        </button>

        <div className="h-px bg-gray-200 w-full"></div>

        {/* Day Selector */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white font-semibold text-sm">
              Mon ●
            </button>
            {['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <button key={day} className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm hover:bg-gray-200 transition-colors">
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Breakdown */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monday, November 5</h2>
            <p className="text-sm text-gray-500">2,450 calories ・ 180g P, 280g C, 65g F</p>
          </div>

          {/* Meal Cards */}
          <MealCard 
            type="Breakfast" 
            calories={550} 
            title="Greek Yogurt Power Bowl"
            image="https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&w=800&q=80"
            macros={{ p: 35, c: 60, f: 12 }}
          />
          <MealCard 
            type="Lunch" 
            calories={750} 
            title="Grilled Chicken Salad"
            image="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
            macros={{ p: 55, c: 40, f: 25 }}
          />
          <MealCard 
            type="Dinner" 
            calories={800} 
            title="Salmon with Asparagus"
            image="https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&w=800&q=80"
            macros={{ p: 60, c: 120, f: 20 }}
          />
          <MealCard 
            type="Snack" 
            calories={350} 
            title="Protein Shake"
            image="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80"
            macros={{ p: 30, c: 60, f: 8 }}
          />
        </section>
      </main>
    </div>
  )
}

function MealCard({ type, calories, title, image, macros }: { 
  type: string
  calories: number
  title: string
  image: string
  macros: { p: number, c: number, f: number }
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <p className="text-gray-500 font-medium">
          {type === 'Breakfast' ? '🌅' : type === 'Lunch' ? '☀️' : type === 'Dinner' ? '🌙' : '💪'} {type} - {calories} cal
        </p>
      </div>
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <span className="text-base">{macroColors.protein.emoji}</span> {macros.p}g
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <span className="text-base">{macroColors.carbs.emoji}</span> {macros.c}g
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <span className="text-base">{macroColors.fat.emoji}</span> {macros.f}g
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 h-10 flex items-center justify-center rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
            View Recipe
          </button>
          <button className="flex-1 h-10 flex items-center justify-center gap-1 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
            <RefreshCw className="size-4" />
            Swap Meal
          </button>
        </div>
      </div>
    </div>
  )
}
