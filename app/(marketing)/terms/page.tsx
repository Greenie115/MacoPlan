import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <div className="bg-card rounded-2xl border border-border-strong p-6 space-y-6">
          <p className="text-sm text-muted-foreground">Last updated: December 17, 2025</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using MacroPlan, you agree to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use our application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground">
              MacroPlan is a meal planning and macro tracking application that provides personalized nutritional
              calculations, meal plan generation, and recipe recommendations based on your profile information and
              fitness goals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You must provide accurate and complete information when creating your
              account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Health Disclaimer</h2>
            <p className="text-muted-foreground">
              MacroPlan provides general nutritional information and meal planning suggestions. Our service is not
              intended to replace professional medical advice, diagnosis, or treatment. Always consult with a qualified
              healthcare provider before making significant changes to your diet or exercise routine.
            </p>
            <p className="text-muted-foreground">
              The nutritional calculations and recommendations provided are estimates based on general formulas and may
              not account for individual health conditions, medications, or specific dietary needs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Acceptable Use</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Share your account credentials with others</li>
              <li>Use automated systems to access the service without permission</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, features, and functionality of MacroPlan are owned by us and are protected by copyright,
              trademark, and other intellectual property laws. You may not copy, modify, or distribute our content
              without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Subscription and Payments</h2>
            <p className="text-muted-foreground">
              Some features of MacroPlan may require a paid subscription. By subscribing, you agree to pay all
              applicable fees. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are
              handled according to our refund policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, MacroPlan shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your use of the service. Our total liability
              shall not exceed the amount you paid for the service in the past twelve months.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for violation of these terms. You may also delete
              your account at any time through the app settings. Upon termination, your right to use the service will
              immediately cease.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of significant changes. Your
              continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with applicable laws, without regard to
              conflict of law principles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these terms, please contact us at{' '}
              <a href="mailto:legal@macroplan.app" className="text-primary hover:underline">
                legal@macroplan.app
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
