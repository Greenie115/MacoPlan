import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <div className="bg-card rounded-2xl border border-border-strong p-6 space-y-6">
          <p className="text-sm text-muted-foreground">Last updated: December 17, 2025</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Macro Plan. We respect your privacy and are committed to protecting your personal data. This
              privacy policy explains how we collect, use, and safeguard your information when you use our application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>
                <strong className="text-foreground">Account Information:</strong> Email address, name, and authentication
                data
              </li>
              <li>
                <strong className="text-foreground">Profile Data:</strong> Age, weight, height, sex, fitness goals, and
                dietary preferences
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> Meal plans created, recipes viewed, and app
                interactions
              </li>
              <li>
                <strong className="text-foreground">Device Information:</strong> Browser type, operating system, and
                device identifiers
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use your information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Calculate your personalized macro targets and nutritional recommendations</li>
              <li>Generate meal plans tailored to your goals and preferences</li>
              <li>Improve our services and develop new features</li>
              <li>Communicate with you about your account and our services</li>
              <li>Ensure the security of your account</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using industry-standard encryption and security practices. We use Supabase
              for our database infrastructure, which provides enterprise-grade security including row-level security
              policies ensuring you can only access your own data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal data. We may share data with third-party service providers who assist in
              operating our application (e.g., authentication services, payment processors) only as necessary to provide
              our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your session and preferences. We do not use third-party advertising
              cookies or trackers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any significant changes by
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or your personal data, please contact us at{' '}
              <a href="mailto:privacy@macroplan.app" className="text-primary hover:underline">
                privacy@macroplan.app
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
