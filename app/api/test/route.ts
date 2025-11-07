import { NextResponse } from "next/server"

export async function GET() {
  const checks = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    edamamId: !!process.env.EDAMAM_APP_ID,
    edamamKey: !!process.env.EDAMAM_APP_KEY,
    stripePublic: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeSecret: !!process.env.STRIPE_SECRET_KEY,
  }

  const allConfigured = Object.values(checks).every((v) => v === true)

  return NextResponse.json({
    status: allConfigured ? "ready" : "needs_configuration",
    checks,
    message: allConfigured
      ? "All environment variables are configured!"
      : "Some environment variables are missing. Check your .env.local file.",
  })
}
