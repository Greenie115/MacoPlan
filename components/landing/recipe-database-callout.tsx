import { UtensilsCrossed } from 'lucide-react'

export function RecipeDatabaseCallout() {
  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10" aria-hidden="true" />
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            If it fits your macros,<br />it's in here
          </h2>

          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8">
            Browse <span className="font-bold text-white">500+ macro-friendly recipes</span> with complete nutritional information
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-primary-foreground/70">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-sm">Recipes</div>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">15+</div>
              <div className="text-sm">Diet Types</div>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20 hidden md:block" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">100%</div>
              <div className="text-sm">Macro-Calculated</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
