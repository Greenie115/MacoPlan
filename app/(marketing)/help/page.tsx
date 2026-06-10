import type { Metadata } from 'next'
import { ArrowLeft, Mail, MessageCircle, FileQuestion } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get help with your MacroPlan account, meal plans, and macro tracking.',
  alternates: {
    canonical: '/help',
  },
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Help Center</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8">
        {/* Contact Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <div className="bg-card rounded-2xl border border-border-strong p-6 space-y-4">
            <p className="text-muted-foreground">
              Need help with MacroPlan? We're here to assist you with any questions or issues.
            </p>
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="size-5 text-primary" />
              <a href="mailto:support@macroplan.app" className="hover:text-primary transition-colors">
                support@macroplan.app
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>

          <div className="space-y-3">
            <details className="bg-card rounded-2xl border border-border-strong group">
              <summary className="p-4 cursor-pointer flex items-center gap-3 font-medium text-foreground list-none">
                <FileQuestion className="size-5 text-primary shrink-0" />
                <span>How do I update my macro targets?</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground">
                <p>
                  Go to your Profile page and tap "Update Macros" or navigate to Edit Profile. You can update your
                  personal stats (weight, height, activity level) and then tap "Recalculate Macros" to get updated
                  targets based on your current data.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-2xl border border-border-strong group">
              <summary className="p-4 cursor-pointer flex items-center gap-3 font-medium text-foreground list-none">
                <FileQuestion className="size-5 text-primary shrink-0" />
                <span>How do I create a meal plan?</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground">
                <p>
                  From the Dashboard, tap "Generate Meal Plan" or navigate to the Plans tab. Select your preferences
                  and MacroPlan will generate a personalized meal plan based on your macro targets.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-2xl border border-border-strong group">
              <summary className="p-4 cursor-pointer flex items-center gap-3 font-medium text-foreground list-none">
                <FileQuestion className="size-5 text-primary shrink-0" />
                <span>Can I customize the recipes in my meal plan?</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground">
                <p>
                  Yes! You can swap recipes within your meal plan by tapping on any meal and selecting "Swap Recipe".
                  You can also adjust serving sizes to better match your needs.
                </p>
              </div>
            </details>

            <details className="bg-card rounded-2xl border border-border-strong group">
              <summary className="p-4 cursor-pointer flex items-center gap-3 font-medium text-foreground list-none">
                <FileQuestion className="size-5 text-primary shrink-0" />
                <span>How do I change my dietary preferences?</span>
              </summary>
              <div className="px-4 pb-4 text-muted-foreground">
                <p>
                  Go to Edit Profile and scroll to the "Dietary Preferences" section. You can update your dietary style
                  (vegetarian, vegan, keto, etc.) and add any foods you want to avoid.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Feature Requests */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Feature Requests</h2>
          <div className="bg-card rounded-2xl border border-border-strong p-6 space-y-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground font-medium">Have a suggestion?</p>
                <p className="text-muted-foreground text-sm mt-1">
                  We love hearing from our users! Send us your feature requests and ideas at{' '}
                  <a href="mailto:feedback@macroplan.app" className="text-primary hover:underline">
                    feedback@macroplan.app
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
