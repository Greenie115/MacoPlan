export function Testimonials() {
  const testimonials = [
    {
      quote: "I've lost 22 pounds without feeling like I'm starving. MacroPlan taught me how to eat better, not less. The meal swapping feature is a lifesaver when I'm traveling for work.",
      name: "Sarah Martinez",
      title: "Marketing Director",
      result: "🎯 Lost 22 lbs",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PdGSF7nBk5bfTB7NIfrvHDDXNrZL-uIWp5alk7v4TkY3MBhCji-tv2bP8p1p6sjYQTQxGko6of3Ucp3svQx-xOCzXXS1S3_2-rfDDBCJFnv1oiE22Jbw9zM_kVNOJAUb-wkGE2xPN2K3SnWh0sUamgVs2QkJt3xJ58v0eq2K3hnWBLJ1s8C1xBH316FfaqcJ3ncMxxsDU84afiQ_bYl6WE6TwxkpRSFVvv3pLZcl4ScSKAkRwXqUVnU3lOXC4WjX5DzB8bNjaRpn",
    },
    {
      quote: "I used to spend 6+ hours every Sunday meal prepping. Now it takes me 30 minutes to follow the plan. I have my weekends back and I'm actually enjoying the food more.",
      name: "Michael Chen",
      title: "Software Engineer",
      result: "⚡ Saves 5+ hrs/week",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBy2qkIlgWNi97-STrMsqkmB095Ajh_Ut7kQEmBkDZVMPmqDz9rCtBf5NrGQFRfGjYicMOpKLZccZydWxLMF2WFjFLYF5vbmwf57-6KODUSodBb7Uh1pKqV3vMHlGJct2UQ41ZBfdWLN8YquaIsMmCeFyjNZU0sWpzsZjLlaMfhLIJJigxIkBoaba7ZWm4ZRsNIndLexb-1ftvhrdZ5m6Z9vY-SZrdwMXDcl8cTIJ9xmJZB_cfWNjLkxDAFha4cVm3f-zFSX67wYsM3",
    },
    {
      quote: "Gained 8 pounds of lean muscle in 3 months. The high-protein meal plans are delicious and the portions are spot-on. My clients always ask what my secret is—it's MacroPlan.",
      name: "Jessica Thompson",
      title: "Personal Trainer",
      result: "💪 Gained 8 lbs muscle",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5k-rcxAHlKYLJGvgx8rarWIAOEhspwRmeNGsaKiY2SGyU1AkxbkdZVelTL1Uz6TRrGcPp7R98iAFrdYSU30DgCOguVi66FfoRPINMlSqOAC4HoDzdOuT-7R2OmaOjAIA2F3GfIpmLby1gEId3braJNZb2Uc1h5qCADZlD344VDxcnw7vb6_G7gXThCDq_TsCoBYouWPb8Sf1dMskdoTgTE533GcwkdjRpbvmCLZPTWyDNb3r8mS5Tzm5XyKQj6vMJoFECE1UkxqM5",
    },
  ]

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Real results from real people</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands who&apos;ve taken back their time and hit their goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card p-8 rounded-2xl border border-border-strong hover:shadow-xl transition-all">
              <div className="inline-block bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-full mb-6">
                {testimonial.result}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-border-strong"
                />
                <div>
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
