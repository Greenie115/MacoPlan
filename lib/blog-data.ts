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
      <p>Calculating your ideal macro split depends on several factors, including your age, sex, activity level, and specific goals (e.g., weight loss, muscle gain, or maintenance). While online calculators can provide a starting point, using an app like MacroPlan can give you a more personalized and adaptive recommendation. The key is to start with a baseline and adjust based on your progress and how you feel.</p>

      <h2>Tips for Success with MacroPlan</h2>
      <p>Consistency is more important than perfection. Aim to hit your macro targets within a small range each day. Use a food scale for accuracy, plan your meals in advance, and don't be afraid to enjoy social events. The beauty of flexible dieting is its adaptability. Track your progress with the MacroPlan app, see what's working, and make small adjustments for long-term success.</p>
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
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
