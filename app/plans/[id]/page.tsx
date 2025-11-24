'use client'

import { PlanDetailView } from '@/components/plans/plan-detail-view'
import { PlanService } from '@/lib/services/plan-service'
import { Plan } from '@/lib/types/plan'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PlanDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    async function fetchPlan() {
      if (id && !authLoading) {
        const planService = new PlanService()
        const fetchedPlan = await planService.getPlanById(id)
        setPlan(fetchedPlan)
        setLoading(false)
      }
    }
    if (!authLoading) {
      fetchPlan()
    }
  }, [id, authLoading])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading plan details...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view this plan.</p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm text-left">
              <p className="font-bold mb-1">Test Credentials:</p>
              <p>Email: testuser@macoplan.com</p>
              <p>Password: password123</p>
            </div>
            {/* Simple Login Form could go here, or link to login page */}
            <Link href="/login" className="block w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Not Found</h2>
          <p className="text-gray-500">This plan doesn't exist or you don't have permission to view it.</p>
          <Link href="/plans" className="text-primary font-bold mt-4 inline-block hover:underline">
            Back to Plans
          </Link>
        </div>
      </div>
    )
  }

  return <PlanDetailView plan={plan} />
}
