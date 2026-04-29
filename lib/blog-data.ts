export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio: string;
  authorImage: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'ultimate-guide-to-flexible-dieting',
    title: 'The Ultimate Guide to Flexible Dieting and Macro Tracking',
    excerpt: 'Flexible dieting, often referred to as "If It Fits Your Macros" (IIFYM), is a popular nutritional approach that focuses on meeting specific macronutrient targets rather than restricting food groups.',
    content: `
      <p>Flexible dieting, often referred to as "If It Fits Your Macros" (IIFYM), is a popular nutritional approach that focuses on meeting specific macronutrient targets rather than restricting food groups. This guide will walk you through the fundamentals of macro tracking and how it can help you achieve your health and fitness goals without sacrificing the foods you love.</p>

      <h2>What Are Macros?</h2>
      <p>Macronutrients, or "macros," are the three primary nutrients your body needs in large amounts to function correctly: protein, carbohydrates, and fats. Each macro provides a specific number of calories per gram and plays a unique role in your body's health.</p>

      <blockquote>Understanding the balance between these three macronutrients is the key to unlocking sustainable results and a healthier relationship with food.</blockquote>

      <h2>How to Calculate Your Macros</h2>
      <p>Calculating your ideal macro split depends on several factors, including your age, sex, activity level, and specific goals (e.g., weight loss, muscle gain, or maintenance). While online calculators can provide a starting point, using an app like Macro Plan can give you a more personalized and adaptive recommendation. The key is to start with a baseline and adjust based on your progress and how you feel.</p>

      <h2>Tips for Success with Macro Plan</h2>
      <p>Consistency is more important than perfection. Aim to hit your macro targets within a small range each day. Use a food scale for accuracy, plan your meals in advance, and don't be afraid to enjoy social events. The beauty of flexible dieting is its adaptability. Track your progress with the Macro Plan app, see what's working, and make small adjustments for long-term success.</p>
    `,
    author: 'Jane Doe, R.D.',
    authorBio: 'Jane is a Registered Dietitian with over 10 years of experience helping clients achieve their nutrition goals through flexible, sustainable approaches. She specializes in macro-based nutrition and sports performance.',
    authorImage: 'https://ui-avatars.com/api/?name=Jane+Doe&background=F97316&color=fff&size=128',
    date: 'October 26, 2023',
    readTime: '8 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdayOWEx3n30yvMdQwGNMr6cnPzF-pjFHaKtrZjkgECyuRv7gwW5bU2qS-VvjY7e4V3FaaUbFfia7OGrZaOiByIra8C4k_AhaBOhEtKDQF03HM5t8mnVieC1pzIIk-YCmxubEw4nq9KbiNwPSJd3KwXmbFaQEiY2U3QSxxAe0OD5B0MgnxNF00AFMT_URN6OU-s3UipdGyHNK0xDBkEaq8Awn-2xKAvyyN2MO02P1r3_BQJKvctzFcNnZ4TEc4flX0uJuJ0JGxuokR',
    category: 'Nutrition'
  },
  {
    slug: 'meal-prepping-for-weight-loss',
    title: 'The Ultimate Guide to Meal Prepping for Weight Loss',
    excerpt: 'Save time, money, and stress with our simple strategies for meal prepping your way to success.',
    content: `
      <p>Meal prepping is one of the most effective tools for weight loss. By preparing your meals in advance, you remove the guesswork and temptation that often leads to unhealthy choices.</p>

      <h2>Why Meal Prep?</h2>
      <p>Meal prepping ensures you always have a healthy option ready to go. It saves you time during the busy work week and helps you stick to your macro goals.</p>

      <h2>Getting Started</h2>
      <p>Start small. You don't need to prep every single meal for the week. Try prepping just your lunches or breakfasts to begin with. Invest in some good quality containers and set aside a couple of hours on Sunday to cook.</p>
    `,
    author: 'John Smith',
    authorBio: 'John is a certified fitness coach and meal prep enthusiast who has helped hundreds of clients simplify their nutrition through strategic meal planning and batch cooking.',
    authorImage: 'https://ui-avatars.com/api/?name=John+Smith&background=F97316&color=fff&size=128',
    date: 'November 15, 2023',
    readTime: '5 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_LiAl5XL3dtrmNHUA1dSd9vIxGBQtAQmNmhgsZb7SxkhQn4CVFc1Peodlj_Y8oIHQa4Ilyuumjd5spGfCX9c_5UPd6A2vLexJeLULvtbk9D3CAWNwUoLyYHkAGYecX1Bs91qkBnnxbuJzS41wL5DkG0m-nxhkJoS-WEQ54yD8K1nTP9Kkpm3AxcKGE-Uh-RA7aaMrC6yxpwDH3iNJSJB3gUBZHBXoM9BXwXKOsrtCVQwYQhWpNevP6aZGqfKaGJDVPnh0dGdOkCob',
    category: 'Meal Prep'
  },
  {
    slug: 'decoding-macros',
    title: 'Decoding Macros: How to Calculate Your Perfect Ratio',
    excerpt: 'Protein, carbs, and fats explained. Learn how to tailor your macronutrient intake to your specific goals.',
    content: `
      <p>Understanding macros is the first step to taking control of your nutrition. But how do you know what ratio is right for you?</p>

      <h2>Protein</h2>
      <p>Protein is essential for muscle repair and growth. A higher protein intake can also help with satiety, making it easier to stick to a calorie deficit.</p>

      <h2>Carbohydrates</h2>
      <p>Carbs are your body's primary energy source. Don't fear them! They fuel your workouts and brain function.</p>

      <h2>Fats</h2>
      <p>Healthy fats are crucial for hormone production and nutrient absorption. Include sources like avocados, nuts, and olive oil in your diet.</p>
    `,
    author: 'Sarah Johnson',
    authorBio: 'Sarah is a nutrition scientist and health coach specializing in evidence-based approaches to sustainable weight management and athletic performance nutrition.',
    authorImage: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=F97316&color=fff&size=128',
    date: 'December 2, 2023',
    readTime: '6 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTCckQtigJXnQVL6umvrRK_5xwlo1aqt44lWvdS-W2W-xDFm5r2adqmceoGZNJtGLNPYpTC7A6mpjd5tSS9XjaqkYzCMMW77M9p9Z9RPLZ8h-opwkTfSKbNdjFK-iMYj7jKAVcMAZnVWVaUrLY0YabSF-ckvIo41YpZmZVrH2Qrd-G9wT24t5tADuV_pg3dz7GgiXcaG22TWYofI8B3_83bKaXpGgRZY6fnTtOQAHW1AYkaLOQKvnZpnE6A5OWvlKa7mERBixNY6ce',
    category: 'Nutrition'
  },
  {
    slug: 'high-protein-breakfasts',
    title: '5 High-Protein Breakfasts to Fuel Your Day',
    excerpt: 'Tired of eggs? Try these delicious and macro-friendly breakfast ideas that will keep you full until lunch.',
    content: `
      <p>Breakfast is the most important meal of the day, especially when you're tracking macros. Here are 5 high-protein options to switch up your morning routine.</p>

      <h2>1. Greek Yogurt Bowl</h2>
      <p>Mix greek yogurt with protein powder and top with berries and granola.</p>

      <h2>2. Protein Pancakes</h2>
      <p>Use a protein pancake mix or make your own with oats, egg whites, and cottage cheese.</p>

      <h2>3. Smoked Salmon Toast</h2>
      <p>Whole grain toast topped with cream cheese and smoked salmon is a delicious savory option.</p>
    `,
    author: 'Mike Williams',
    authorBio: 'Mike is a recipe developer and fitness enthusiast who creates delicious, macro-friendly meals that prove healthy eating doesn\'t have to be boring.',
    authorImage: 'https://ui-avatars.com/api/?name=Mike+Williams&background=F97316&color=fff&size=128',
    date: 'December 10, 2023',
    readTime: '4 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Yh-JKBwBpwvIvagriMdQPCRUz6gEJ4FEmkpXm-djjfvqSVeXNM9xwQFoQqbFGuVnLTkhiQLMPy9pnSdez0UoyQJNfaH9mLDqArr13onR7NmlrZ2JrqIqnuAZ50bsaakeJuAetYEu5D8Gbo-xht8apTx1F2eRyieT8BgaO6ROi_VKNWTBeTXthdM_XfC5SRNY1cTuTQP65KHK2DWA-13caDqE1COKhjhMHgEw3y6G3JIGjWCj2iOj8W65XDD_Ui02kO2OE3vn4pEm',
    category: 'Recipes'
  },
  {
    slug: 'protein-on-rest-days',
    title: 'Rest Day Protein: Hit Your Target When Appetite Drops',
    excerpt: 'Rest day protein is the quiet leak in most lifters\' weeks. Here\'s why appetite drops on off days and five tactics to keep your weekly average where it needs to be.',
    content: `
      <p>It's 3 p.m. on Sunday. Yesterday, your last training day, you hit 215 g of protein without thinking about it. Today you're at 48 g, mildly bored of food, and the chicken in the fridge feels like a chore.</p>

      <p>Rest day protein is the quiet leak in most lifters' weeks. Training-day appetite carries you through 200 g without effort. On rest days the cues drop out, you eat half as much, and the weekly average sags. Over a 16-week cut or a lean bulk, that gap is the difference between holding muscle and watching the scale lie about your composition.</p>

      <p>Here's why it happens, and five tactics that fix it without forcing yourself to eat when you're genuinely not hungry.</p>

      <h2>Why Hitting Protein on Rest Days Is Harder</h2>
      <p>It feels like a willpower problem. It's mostly biology and routine.</p>

      <p><strong>Energy expenditure is lower.</strong> A heavy training session burns 400–700 calories on top of your baseline. Lose that and your overall hunger drive softens by mid-afternoon. Less expenditure, less ghrelin, less appetite.</p>

      <p><strong>The post-workout hunger window is gone.</strong> Most lifters know that 60–90 minute window after a session where the first big meal goes down easy. Without training, that window never opens, and your largest protein hit of the day vanishes with it.</p>

      <p><strong>Your environmental cues disappear.</strong> Training-day eating runs on rails: pre-workout meal at 11, intra-workout shake, post-workout chicken and rice at 3, dinner at 7. Rest days have no anchors. Meals drift later, get smaller, or get skipped.</p>

      <p><strong>Cortisol and acute stress drop.</strong> Lower training stress means lower acute appetite signaling. Counter-intuitively, calmer days often mean less hunger, not more.</p>

      <p>The fix isn't to eat the same way you do on training days. It's to design rest days as a separate problem with their own rules.</p>

      <h2>Five Ways to Hit Protein on Rest Days</h2>

      <h3>1. Front-Load Protein Before Noon</h3>
      <p>The simplest fix. Get 60–80 g of protein in before lunch, while morning hunger is still doing the work for you. Three eggs plus a 40 g whey shake plus 200 g of Greek yogurt is 65 g and takes ten minutes.</p>

      <p>If your appetite reliably drops after lunch on rest days, that one habit alone can move you from 130 g to 180 g without any further effort.</p>

      <h3>2. Lean on Liquid Protein</h3>
      <p>Whey, casein, and milk go down when solid food doesn't. A casein shake before bed is one of the highest-leverage tactics on a rest day: 30–40 g of slow-digesting protein with no chewing required.</p>

      <p>Two shakes a day on rest days is fine. The "always eat whole foods" advice is usually given to people who don't lift or track. As a lifter you're already getting plenty of whole-food protein on training days.</p>

      <h3>3. Pre-Portion the Night Before</h3>
      <p>Decisions cost more than calories on rest days. If you have to look at the fridge and decide what to eat, you'll eat less. If 200 g of cooked chicken is already weighed into a container, labeled with macros, and sitting at the front of the shelf, it goes in.</p>

      <p>This is where batch cooking pays off twice. The plan you cooked Sunday is already portioned. You don't decide — you just eat the next container.</p>

      <h3>4. Build Protein-Dense Snack Defaults</h3>
      <p>Identify three high-protein snacks you actually like and keep them stocked. Options that work for most lifters:</p>
      <ul>
        <li>Cottage cheese with a drizzle of honey (200 g = 26 g protein)</li>
        <li>Skyr or 0% Greek yogurt with frozen berries (170 g = 17 g protein)</li>
        <li>Beef jerky or biltong (50 g = 25 g protein)</li>
        <li>Cold rotisserie chicken pulled apart by hand (150 g = 45 g protein)</li>
        <li>Protein pudding: a scoop of whey stirred into Greek yogurt (50 g protein)</li>
      </ul>
      <p>The goal is zero decision. You're not hungry, you don't want to cook, but you can absolutely eat a tub of cottage cheese while you watch a movie.</p>

      <h3>5. Lower the Bar Slightly, But Not Much</h3>
      <p>Some lifters aim for 100% of their training-day protein on rest days. That's overkill. Total weekly protein matters more than any single day; if your training-day intake is 220 g, hitting 180–200 g on rest days keeps your weekly average where it needs to be.</p>

      <p>The consensus on protein distribution is straightforward: most lifters benefit from 1.6–2.2 g per kg (0.7–1 g per lb) of bodyweight averaged across the week, spread across 3–5 meals at roughly 0.4 g per kg per meal. Missing your training-day target by 20 g once a week isn't a problem. Missing it by 80 g twice a week is.</p>

      <p>Set a rest-day target around 90% of training-day. It removes the all-or-nothing feeling and makes the day winnable.</p>

      <blockquote>Protein is a weekly target, not a daily one. The lifters who hold muscle through a cut aren't the ones who never miss. They're the ones who don't let two missed days become five.</blockquote>

      <h2>Where MacroPlan Fits</h2>
      <p>MacroPlan generates separate macro targets for training and rest days based on your training frequency, then builds the prep around both. The Sunday batch cook fills the week's containers, including portioned rest-day meals at a slightly lower calorie target with the same protein density. You don't have to decide what to eat on a rest day. The container is already in the fridge with the macros printed on it.</p>

      <p>You can read more about how training-day and rest-day splits get calculated in our <a href="/blog/decoding-macros">guide to calculating your macros</a>, or our broader <a href="/blog/meal-prepping-for-weight-loss">meal prep playbook for weight loss</a>.</p>

      <h2>The Real Test</h2>
      <p>Track your protein for one week with separate training-day and rest-day numbers. Average them. If your rest-day intake is more than 30 g below training day, you've found the leak. The five tactics above close it within a week or two for most lifters.</p>

      <p>Ready to stop guessing what to eat on rest days? <a href="https://macroplan.app/signup">Generate your first meal plan free →</a></p>
    `,
    author: 'Macro Plan Team',
    authorBio: 'The Macro Plan team writes practical, evidence-informed content for lifters who track macros and meal-prep their week.',
    authorImage: 'https://ui-avatars.com/api/?name=Macro+Plan&background=F97316&color=fff&size=128',
    date: 'April 29, 2026',
    readTime: '6 min read',
    image: 'https://placehold.co/1200x630/F97316/ffffff?text=Rest+Day+Protein',
    category: 'Nutrition'
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
