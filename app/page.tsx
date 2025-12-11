import Link from 'next/link'
import { 
  Utensils, 
  Sparkles, 
  Target, 
  BookOpen, 
  ArrowRight, 
  ChevronDown, 
  Menu,
  X
} from 'lucide-react'
import { blogPosts } from '@/lib/blog-data'

export default function LandingPage() {
  const recentPosts = blogPosts.slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-background/95 backdrop-blur-md border-b border-border-strong">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
              <Utensils className="w-8 h-8 text-primary" />
              <span>MacroPlan</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Sign Up Now
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Hero Section */}
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Stop guessing. <br />
              Start <span className="text-primary">achieving.</span>
            </h1>
            <p className="text-lg text-subtle-foreground mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Create macro-perfect meal plans in seconds. MacroPlan takes the guesswork out of nutrition so you can focus on hitting your goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link href="/signup" className="w-full sm:w-auto bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
                <span>Generate Your First Plan</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto bg-card border border-border-strong hover:bg-muted font-bold py-4 px-8 rounded-xl transition-colors">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            {/* Main App Image */}
            <div className="relative z-10 rounded-2xl shadow-2xl shadow-black/20 transform -rotate-2 border border-border/50 bg-card overflow-hidden">
               <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF8N8Djf13ev-xCTPNpInws-ZPcDq1jCtpaxreehSdhlwKaMD9dapip8gPwh9hOeTbIKg6EvjFoUcshoB_wiieORmDvBjzaHafIjuHblLRV739tvkl0EVVzxMy0QEVgEXig8RsC6SK9gZXYL281ZMmSv5tbjHkNd8S9H0XsR_Kdk_kukBHJesLZGOxnU8phUIfpuooyuGGxH9qNRcQqoGTq1zyvczumzOt4FX7xMTu5lo7LZIIvsEjqhKcuqkK7gdVs6_NVtikNbX5" 
                alt="MacroPlan Dashboard"
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="hidden lg:block absolute top-1/2 -left-12 w-64 rounded-2xl shadow-xl border-4 border-card bg-card transform rotate-6 z-20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWQgDuQLy-_G7H1BckJ1JkEo5lif01tAONOPJbPdnLwhXmQwe2USGc0RJAfEiAll9VNDcU08JKADLe811XAVUFK8Tyb8fdEQDUnPZb20x3y7LX6J1drpGIaCuLokkvV2BTzidUPvFlwf6IXxi4T0WQ0ZRrMCK6klxJhQb_Jgxbx_itYIWLHDP4Nq2698hULrg6KAxubxg95CjY5NoVoKq3INv_Lcjw0BfB52iMUOZWktEDaRcUVPDIaR-MpRigX1oA6D0NW0Jv71NL" 
                alt="Meal Plan"
                className="w-full rounded-lg"
              />
            </div>
             <div className="hidden lg:block absolute -bottom-8 -right-4 w-64 rounded-2xl shadow-xl border-4 border-card bg-card transform -rotate-3 z-20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK7MMETtn0uO5at0NVwg9iZ-rYNyTwm596tNWobDzRD2nHjCrZmJtEOlQklS2rp38R1BW4gnnq_ABea55s5Wn8ZVc8G3W5eMDB13QgNwvzSM3VLMiiZG4qLqpZ3igVd9ESJF8veiQDl-pIS9UaY1GKOcbqDrj1fG8wTN-YULfBdduJlFW6-esMfNLrH2cvdx5f_mc23p1Q1FPRdwABiZWGhMJoz4jRuW4CR-sA_ElisYG2RNG-_qsaBEzAPf8jJxrp7c5wKT3rfviA" 
                alt="Preferences"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/50 mt-20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed.</h2>
              <p className="text-lg text-subtle-foreground">
                MacroPlan is more than a calorie counter. It's your personal nutritionist, chef, and accountability partner all in one.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong hover:shadow-md transition-shadow">
                <div className="bg-primary/10 text-icon w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Meal Plans</h3>
                <p className="text-subtle-foreground leading-relaxed">
                  Generate personalized meal plans that fit your exact macros and dietary preferences in just 3 seconds.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong hover:shadow-md transition-shadow">
                <div className="bg-primary/10 text-icon w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Accurate Macro Tracking</h3>
                <p className="text-subtle-foreground leading-relaxed">
                  Effortlessly track your protein, carbs, and fats with our simple interface and extensive food database.
                </p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong hover:shadow-md transition-shadow">
                <div className="bg-primary/10 text-icon w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Delicious Recipes</h3>
                <p className="text-subtle-foreground leading-relaxed">
                  Explore hundreds of tasty, easy-to-make recipes that make hitting your macros a joy, not a chore.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by thousands of users</h2>
              <p className="text-lg text-subtle-foreground">
                Don't just take our word for it. Here's what our community is saying.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong">
                <p className="text-subtle-foreground mb-6 italic">
                  "MacroPlan has been a game-changer. I've finally broken through my weight loss plateau. The meal plans are delicious and so easy to follow!"
                </p>
                <div className="flex items-center">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8PdGSF7nBk5bfTB7NIfrvHDDXNrZL-uIWp5alk7v4TkY3MBhCji-tv2bP8p1p6sjYQTQxGko6of3Ucp3svQx-xOCzXXS1S3_2-rfDDBCJFnv1oiE22Jbw9zM_kVNOJAUb-wkGE2xPN2K3SnWh0sUamgVs2QkJt3xJ58v0eq2K3hnWBLJ1s8C1xBH316FfaqcJ3ncMxxsDU84afiQ_bYl6WE6TwxkpRSFVvv3pLZcl4ScSKAkRwXqUVnU3lOXC4WjX5DzB8bNjaRpn" alt="Sarah K." className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <p className="font-bold">Sarah K.</p>
                    <p className="text-sm text-subtle-foreground">Fitness Enthusiast</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong">
                <p className="text-subtle-foreground mb-6 italic">
                  "As a busy professional, I don't have time to think about what to eat. MacroPlan does it all for me. I'm eating healthier and have more energy than ever."
                </p>
                <div className="flex items-center">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy2qkIlgWNi97-STrMsqkmB095Ajh_Ut7kQEmBkDZVMPmqDz9rCtBf5NrGQFRfGjYicMOpKLZccZydWxLMF2WFjFLYF5vbmwf57-6KODUSodBb7Uh1pKqV3vMHlGJct2UQ41ZBfdWLN8YquaIsMmCeFyjNZU0sWpzsZjLlaMfhLIJJigxIkBoaba7ZWm4ZRsNIndLexb-1ftvhrdZ5m6Z9vY-SZrdwMXDcl8cTIJ9xmJZB_cfWNjLkxDAFha4cVm3f-zFSX67wYsM3" alt="Mike R." className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <p className="font-bold">Mike R.</p>
                    <p className="text-sm text-subtle-foreground">Entrepreneur</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border-strong">
                <p className="text-subtle-foreground mb-6 italic">
                  "I love how flexible the app is. I can easily swap meals if I'm not in the mood for something. It makes sticking to my diet so much easier."
                </p>
                <div className="flex items-center">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5k-rcxAHlKYLJGvgx8rarWIAOEhspwRmeNGsaKiY2SGyU1AkxbkdZVelTL1Uz6TRrGcPp7R98iAFrdYSU30DgCOguVi66FfoRPINMlSqOAC4HoDzdOuT-7R2OmaOjAIA2F3GfIpmLby1gEId3braJNZb2Uc1h5qCADZlD344VDxcnw7vb6_G7gXThCDq_TsCoBYouWPb8Sf1dMskdoTgTE533GcwkdjRpbvmCLZPTWyDNb3r8mS5Tzm5XyKQj6vMJoFECE1UkxqM5" alt="Jessica L." className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <div>
                    <p className="font-bold">Jessica L.</p>
                    <p className="text-sm text-subtle-foreground">Personal Trainer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Preview Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">From the MacroPlan Blog</h2>
                <p className="text-lg text-subtle-foreground">
                  Get tips, tricks, and delicious recipes to help you on your health journey.
                </p>
              </div>
              <Link href="/blog" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:underline">
                View all posts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <Link 
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-card rounded-2xl shadow-sm border border-border-strong overflow-hidden flex flex-col hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-subtle-foreground flex-grow line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto font-semibold text-primary flex items-center gap-1">
                      Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center md:hidden">
              <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                View all posts <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Is MacroPlan right for me?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  MacroPlan is perfect for anyone looking to improve their nutrition, whether your goal is to lose weight, build muscle, or simply eat healthier. Our personalized plans adapt to your specific needs.
                </p>
              </details>
              
              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  Can I customize my meal plan?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  Absolutely! You can specify dietary preferences like vegetarian, gluten-free, keto, and more. You can also easily swap out any meal in your plan for another one that fits your macros.
                </p>
              </details>
              
              <details className="group bg-card p-6 rounded-xl border border-border-strong [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-lg list-none">
                  What if I have my own recipes?
                  <ChevronDown className="w-5 h-5 text-icon transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-subtle-foreground mt-4 leading-relaxed">
                  You can add your own custom foods and recipes to our database. MacroPlan will automatically calculate the nutritional information and allow you to incorporate them into your meal plans.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-20 text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
               {/* Background Pattern */}
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
               </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to Transform Your Nutrition?</h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto relative z-10">
                Join thousands of users hitting their goals with personalized meal plans. Get started for free today.
              </p>
              <Link href="/signup" className="inline-block bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-white/90 transition-colors shadow-lg relative z-10">
                Generate My Plan in 3 Seconds
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-muted border-t border-border-strong">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 MacroPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
