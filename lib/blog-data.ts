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

const TEAM_AUTHOR = 'MacroPlan Team';
const TEAM_BIO =
  'The MacroPlan team writes practical, evidence-informed guides for lifters who track macros and meal-prep their week.';
const TEAM_IMAGE =
  'https://ui-avatars.com/api/?name=MacroPlan&background=FF6B5C&color=fff&size=128';

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
      <p>Calculating your ideal macro split depends on several factors, including your age, sex, activity level, and specific goals (e.g., weight loss, muscle gain, or maintenance). While online calculators can provide a starting point, using an app like MacroPlan can give you a more personalized and adaptive recommendation. The key is to start with a baseline and adjust based on your progress and how you feel. For a deeper breakdown, see our <a href="/blog/decoding-macros">guide to calculating your perfect ratio</a>.</p>

      <h2>Tips for Success with MacroPlan</h2>
      <p>Consistency is more important than perfection. Aim to hit your macro targets within a small range each day. Use a food scale for accuracy, plan your meals in advance, and don't be afraid to enjoy social events. The beauty of flexible dieting is its adaptability. Track your progress with MacroPlan, see what's working, and make small adjustments for long-term success.</p>

      <p>Ready to stop guessing? <a href="https://macroplan.app/signup">Generate your first meal plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'October 26, 2023',
    readTime: '8 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Flexible+Dieting',
    category: 'Nutrition'
  },
  {
    slug: 'meal-prepping-for-weight-loss',
    title: 'The Ultimate Guide to Meal Prepping for Weight Loss',
    excerpt: 'Save time, money, and stress with our simple strategies for meal prepping your way to success.',
    content: `
      <p>Meal prepping is one of the most effective tools for weight loss. By preparing your meals in advance, you remove the guesswork and temptation that often leads to unhealthy choices.</p>

      <h2>Why Meal Prep?</h2>
      <p>Meal prepping ensures you always have a healthy option ready to go. It saves you time during the busy work week and helps you stick to your macro goals. The single biggest driver of a failed diet is the unplanned meal eaten when you're hungry and have no good option ready.</p>

      <h2>Getting Started</h2>
      <p>Start small. You don't need to prep every single meal for the week. Try prepping just your lunches or breakfasts to begin with. Invest in some good quality containers and set aside a couple of hours on Sunday to cook.</p>

      <h2>Build Around Protein</h2>
      <p>Whatever your calorie target, anchor each prepped meal around a protein source first, then add vegetables and a measured carb. Protein keeps you full in a deficit, which is exactly where weight loss happens. If you struggle to hit your protein target, our <a href="/blog/high-protein-breakfasts">high-protein breakfast ideas</a> are an easy place to start.</p>

      <p>Want the prep done for you? <a href="https://macroplan.app/signup">Generate your first meal plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'November 15, 2023',
    readTime: '5 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Meal+Prep+for+Weight+Loss',
    category: 'Meal Prep'
  },
  {
    slug: 'decoding-macros',
    title: 'Decoding Macros: How to Calculate Your Perfect Ratio',
    excerpt: 'Protein, carbs, and fats explained. Learn how to tailor your macronutrient intake to your specific goals.',
    content: `
      <p>Understanding macros is the first step to taking control of your nutrition. But how do you know what ratio is right for you?</p>

      <h2>Protein</h2>
      <p>Protein is essential for muscle repair and growth. A higher protein intake can also help with satiety, making it easier to stick to a calorie deficit. Most lifters do well on roughly 1.6–2.2 g per kg (0.7–1 g per lb) of bodyweight per day.</p>

      <h2>Carbohydrates</h2>
      <p>Carbs are your body's primary energy source. Don't fear them! They fuel your workouts and brain function. They're also the macro you'll flex up and down depending on whether it's a training or rest day.</p>

      <h2>Fats</h2>
      <p>Healthy fats are crucial for hormone production and nutrient absorption. Include sources like avocados, nuts, and olive oil in your diet, and keep fat at a minimum of around 0.5 g per kg of bodyweight.</p>

      <h2>Putting It Together</h2>
      <p>Set protein first, set a fat floor, and let carbohydrates fill the rest of your calorie budget. If you train some days and rest others, your carb number is where most of the adjustment happens — more on that in our guide to <a href="/blog/calorie-cycling-training-rest-days">calorie cycling across training and rest days</a>.</p>

      <p><a href="https://macroplan.app/signup">Let MacroPlan calculate your ratio for free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'December 2, 2023',
    readTime: '6 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Decoding+Macros',
    category: 'Nutrition'
  },
  {
    slug: 'high-protein-breakfasts',
    title: '5 High-Protein Breakfasts to Fuel Your Day',
    excerpt: 'Tired of eggs? Try these delicious and macro-friendly breakfast ideas that will keep you full until lunch.',
    content: `
      <p>Breakfast is the most important meal of the day, especially when you're tracking macros. Here are 5 high-protein options to switch up your morning routine.</p>

      <h2>1. Greek Yogurt Bowl</h2>
      <p>Mix Greek yogurt with protein powder and top with berries and granola. Around 40 g of protein with almost no effort.</p>

      <h2>2. Protein Pancakes</h2>
      <p>Use a protein pancake mix or make your own with oats, egg whites, and cottage cheese.</p>

      <h2>3. Smoked Salmon Toast</h2>
      <p>Whole grain toast topped with cream cheese and smoked salmon is a delicious savory option.</p>

      <h2>4. Cottage Cheese Scramble</h2>
      <p>Stir cottage cheese into scrambled eggs for a creamy, protein-dense plate that holds you to lunch.</p>

      <h2>5. Overnight Oats with Whey</h2>
      <p>Oats, milk, a scoop of whey, and chia seeds prepped the night before — grab-and-go protein for busy mornings.</p>

      <p>Front-loading protein at breakfast makes the rest of your day easier to hit. <a href="https://macroplan.app/signup">Build your full plan free with MacroPlan →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'December 10, 2023',
    readTime: '4 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=High-Protein+Breakfasts',
    category: 'Recipes'
  },
  {
    slug: 'high-protein-meal-prep-muscle',
    title: 'High-Protein Meal Prep for Muscle Gain: A Lifter’s Playbook',
    excerpt: 'Building muscle is a logistics problem as much as a training one. Here’s how to prep a week of high-protein food that actually supports growth — without living in your kitchen.',
    content: `
      <p>You can train perfectly and still not grow. If the protein and calories aren't there, week after week, the stimulus has nothing to build with. For most lifters, the limiting factor isn't the program — it's getting enough quality food in consistently. That's a logistics problem, and meal prep is how you solve it.</p>

      <h2>Start With Your Protein Target</h2>
      <p>Muscle gain runs on protein. The research consensus lands around 1.6–2.2 g per kilogram of bodyweight per day (roughly 0.7–1 g per pound). An 80 kg lifter is looking at 130–175 g daily. The exact number matters less than hitting a number near the top of that range, every day, for months.</p>

      <p>Once you know the daily target, divide it across 3–5 meals at roughly 0.4 g per kg per meal. That distribution keeps muscle protein synthesis elevated through the day rather than cramming everything into dinner. Set protein first; everything else in your prep is built around it. If you're unsure how to set the rest of your macros, start with our <a href="/blog/decoding-macros">guide to calculating your ratio</a>.</p>

      <h2>The Bulk-Cook Protein Rotation</h2>
      <p>You don't need 14 different recipes. You need 3–4 protein sources you can cook in bulk and rotate so you don't get bored by Wednesday. A reliable rotation:</p>
      <ul>
        <li><strong>Oven:</strong> 1.5–2 kg of chicken thighs or breast, seasoned three different ways across the tray</li>
        <li><strong>Stovetop:</strong> a big batch of lean beef mince or turkey for bowls, wraps, and scrambles</li>
        <li><strong>Bake:</strong> a tray of salmon or white fish for two of the week's dinners</li>
        <li><strong>Fast protein:</strong> hard-boiled eggs, Greek yogurt, and a tub of cottage cheese for snacks and gaps</li>
      </ul>
      <p>Cook the proteins plain or lightly seasoned, then change the flavor at the plate with different sauces. Same chicken becomes a burrito bowl, a stir-fry, and a salad without tasting identical.</p>

      <h2>Carbs Are the Lever for Growth</h2>
      <p>On a muscle-gain phase you're eating in a slight surplus, and carbohydrates are where most of those extra calories should go. They fuel hard training and spare protein for its actual job — repair. Batch-cook carbs that reheat well: rice, potatoes, pasta, and oats. Weigh them cooked into your containers so the surplus is deliberate, not accidental.</p>

      <blockquote>A "lean bulk" fails in one of two directions: too small a surplus and you don't grow, too large and you just get fat. Prepping your carbs by weight is how you keep the surplus honest.</blockquote>

      <h2>Make the Calories Easy to Hit</h2>
      <p>The hardest part of gaining is the back half of a big eating day when you're full. Build in calorie-dense, easy-to-eat options so you're not force-feeding chicken at 9 p.m.:</p>
      <ul>
        <li>A blended shake with whey, oats, peanut butter, and banana (600+ calories, drinks in two minutes)</li>
        <li>Trail mix or nuts portioned into the week's snack slots</li>
        <li>Whole milk or a mass-gainer-style smoothie if you're a hard gainer</li>
      </ul>

      <h2>The Sunday Session</h2>
      <p>Block two hours. Start the oven proteins first, get rice and potatoes going while they cook, portion everything into containers labeled with macros, and you're done for five days. If you've never run a structured prep day, our <a href="/blog/meal-prepping-for-weight-loss">meal prep playbook</a> walks through the basics — the same workflow applies whether you're cutting or gaining.</p>

      <p>MacroPlan generates a full muscle-gain prep around your protein and calorie targets, including the shopping list and a cooking order for prep day. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'January 14, 2026',
    readTime: '7 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=High-Protein+Meal+Prep',
    category: 'Meal Prep'
  },
  {
    slug: 'how-much-protein-to-build-muscle',
    title: 'How Much Protein Do You Actually Need to Build Muscle?',
    excerpt: 'The internet says everything from 0.8 g to 4 g per kilo. Here’s what the research actually supports — and how to set a number you can hit every day.',
    content: `
      <p>Ask ten lifters how much protein you need and you'll get ten answers. Some are anchored to outdated RDA figures meant for sedentary people; others are repeating supplement-industry numbers designed to sell more powder. The actual evidence is narrower and more boring than either camp.</p>

      <h2>The Number the Research Supports</h2>
      <p>Across meta-analyses of resistance-trained people, the benefit of additional protein for muscle growth plateaus around <strong>1.6 g per kilogram of bodyweight per day</strong>, with a sensible upper bound near <strong>2.2 g per kg</strong> for most lifters. In pounds, that's roughly 0.7–1 g per pound of bodyweight.</p>

      <p>For an 80 kg (176 lb) lifter, that's about 130–175 g of protein per day. Eating well above that range won't hurt a healthy person, but it also won't build extra muscle — it just displaces other food or calories.</p>

      <blockquote>More protein is not more muscle past a point. Once you're in the 1.6–2.2 g/kg range, training and consistency drive the result, not the next scoop.</blockquote>

      <h2>When to Aim Higher in the Range</h2>
      <p>Push toward 2.2 g/kg if you're:</p>
      <ul>
        <li><strong>In a calorie deficit</strong> (cutting) — higher protein protects muscle when calories are low and improves fullness</li>
        <li><strong>Older</strong> — anabolic resistance means seniors benefit from slightly more protein per meal</li>
        <li><strong>Very lean and advanced</strong> — the closer you are to your genetic ceiling, the more the details matter</li>
      </ul>

      <h2>Distribution Beats Heroics</h2>
      <p>Total daily protein is what matters most, but how you spread it helps. Aim for 3–5 meals each delivering around 0.4 g per kg — roughly 25–40 g per meal for most people. That keeps muscle protein synthesis topped up through the day rather than relying on one giant dinner.</p>

      <p>The practical problem is the back end of the day, especially on rest days when appetite naturally drops. Keeping pre-portioned protein and a couple of liquid options ready is the simplest way to stop the daily total from sagging.</p>

      <h2>How to Actually Hit It</h2>
      <p>Knowing the number is easy; hitting it daily is the work. Three habits do most of the lifting:</p>
      <ul>
        <li><strong>Front-load.</strong> Get 30–50 g in at breakfast while morning hunger helps you. Our <a href="/blog/high-protein-breakfasts">high-protein breakfast list</a> makes that simple.</li>
        <li><strong>Prep it.</strong> Pre-portioned protein in the fridge removes the decision. You eat the container; you don't negotiate with yourself.</li>
        <li><strong>Keep liquid backups.</strong> Whey and Greek yogurt close gaps on days solid food won't go down.</li>
      </ul>

      <p>MacroPlan sets your protein target from your bodyweight, goal, and activity level, then builds a week of prep that actually delivers it. <a href="https://macroplan.app/signup">Find your number free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'February 3, 2026',
    readTime: '6 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=How+Much+Protein',
    category: 'Nutrition'
  },
  {
    slug: 'meal-prep-on-a-cut',
    title: 'Meal Prep on a Cut: How to Stay Full While Losing Fat',
    excerpt: 'The deficit is the hard part — not the math, the hunger. Here’s how to prep meals that keep you full on fewer calories so the cut actually sticks.',
    content: `
      <p>Cutting is simple on paper: eat fewer calories than you burn, keep protein high, keep training hard. The reason most cuts fail has nothing to do with the math. It's hunger, decision fatigue, and a fridge full of nothing you want to eat at 8 p.m. Meal prep is how you engineer those failure points out of the week.</p>

      <h2>Protein and Volume Are Your Two Levers</h2>
      <p>In a deficit, two things keep you full: high protein and high food volume. Protein is the most satiating macro and protects muscle while you lose fat, so keep it at the top of your range — around 2–2.2 g per kg of bodyweight. Volume means choosing foods that take up space in your stomach for few calories.</p>

      <p>Build every prepped meal as: a big lean protein, a large pile of high-volume vegetables, and a measured portion of carbs. The protein and veg do the work of keeping you full; the weighed carb keeps the calories controlled.</p>

      <h2>High-Volume Foods to Prep Around</h2>
      <ul>
        <li><strong>Proteins:</strong> chicken breast, white fish, lean turkey, egg whites, 0% Greek yogurt</li>
        <li><strong>Volume veg:</strong> broccoli, zucchini, peppers, spinach, cauliflower rice, mushrooms</li>
        <li><strong>Smart carbs:</strong> potatoes (one of the most filling foods per calorie), oats, rice, legumes</li>
        <li><strong>Free flavor:</strong> hot sauce, mustard, vinegar, herbs, spices, zero-calorie seasonings</li>
      </ul>

      <blockquote>Swapping a cup of rice for cauliflower rice plus a smaller measured carb can save 150+ calories and leave you with more food on the plate, not less.</blockquote>

      <h2>Pre-Portion to Beat Decision Fatigue</h2>
      <p>The most dangerous moment on a cut is when you're hungry, tired, and staring into the fridge with no plan. Every unportioned meal is a negotiation you might lose. When 200 g of cooked chicken, a tray of roasted vegetables, and a weighed potato are already sitting in a labeled container, there's no decision to make. You eat the plan.</p>

      <p>This is the same principle behind any good <a href="/blog/meal-prepping-for-weight-loss">weight-loss meal prep</a> — but on a cut the stakes are higher because the deficit leaves less room for improvised eating.</p>

      <h2>Plan Your Refeeds and Treats</h2>
      <p>A cut you can't sustain isn't a good cut. Build a planned higher-carb day or a budgeted treat into the week on purpose. Flexible dieting works precisely because it bends without breaking — if you've never run macros this way, our <a href="/blog/ultimate-guide-to-flexible-dieting">flexible dieting guide</a> covers the mindset. The goal is a deficit you can hold for 8–16 weeks, not a perfect three days followed by a blowout.</p>

      <h2>Don't Slash Calories Too Hard</h2>
      <p>An aggressive deficit feels productive for a week and then wrecks your energy, training, and adherence. A moderate deficit — roughly 300–500 calories below maintenance — loses fat at a sustainable rate while leaving enough food to stay sane and strong. Prep makes that moderate deficit feel like more food than it is, because none of it is wasted on meals you don't want.</p>

      <p>MacroPlan builds a high-protein, high-volume cut around a sensible deficit, with the shopping list and prep order included. <a href="https://macroplan.app/signup">Start your cut plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'March 9, 2026',
    readTime: '7 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Meal+Prep+on+a+Cut',
    category: 'Meal Prep'
  },
  {
    slug: 'calorie-cycling-training-rest-days',
    title: 'Calorie Cycling: Why Your Training and Rest Days Shouldn’t Match',
    excerpt: 'You don’t burn the same energy on leg day as you do on the couch — so why eat the same? A practical look at training-day and rest-day calorie cycling.',
    content: `
      <p>Most people eat the same number of calories every day, all week. It's simpler, and for plenty of goals it's perfectly fine. But if you train hard some days and rest others, your body's energy demand swings a lot from day to day — and matching your intake to that swing can make a cut or a lean bulk more comfortable and more effective. That's calorie cycling.</p>

      <h2>The Basic Idea</h2>
      <p>Calorie cycling means eating more on training days and less on rest days, while keeping your weekly average where it needs to be for your goal. A heavy session can burn several hundred extra calories; you eat into that on training days, then pull calories back on rest days when you're doing less.</p>

      <p>Crucially, the change happens almost entirely in carbohydrates. Protein stays high and steady every day to support muscle. Fat stays at a sensible floor. Carbs flex up on training days to fuel performance and recovery, and down on rest days when you don't need as much fuel. If macro splits are new to you, our <a href="/blog/decoding-macros">decoding macros guide</a> covers how to set each one.</p>

      <blockquote>Hold protein constant, anchor fat at a floor, and cycle carbs. That's 90% of calorie cycling in one sentence.</blockquote>

      <h2>Why It Helps</h2>
      <ul>
        <li><strong>Better training:</strong> more carbs on training days means more glycogen, better performance, and better recovery from the session that actually drives progress.</li>
        <li><strong>Easier dieting:</strong> on a cut, higher-carb training days give you psychological relief and bigger meals around your workout, making the lower rest days easier to accept.</li>
        <li><strong>Cleaner surplus:</strong> on a lean bulk, concentrating extra calories on training days means more of the surplus goes toward fueling and recovering from training, not just sitting around on rest days.</li>
      </ul>

      <h2>A Simple Way to Set It Up</h2>
      <p>Start from your weekly calorie target, then redistribute:</p>
      <ol>
        <li>Calculate your total weekly calories (daily target × 7).</li>
        <li>Add 10–20% to training days.</li>
        <li>Subtract from rest days so the weekly total still matches.</li>
        <li>Keep protein the same every day; make the difference with carbs.</li>
      </ol>
      <p>If you train four days a week, you might run training days a few hundred calories above maintenance and rest days a few hundred below, averaging out to your goal across the week.</p>

      <h2>The Catch: Logistics</h2>
      <p>Calorie cycling is more planning. You now have two daily templates instead of one, and rest days come with their own problem — appetite tends to drop right when you're trying to keep protein up, so pre-portioned rest-day meals matter even more than usual.</p>

      <p>This is exactly where batch prep earns its keep. If your training-day and rest-day containers are both cooked and labeled on Sunday, the cycling happens automatically — you just grab the right container for the day. MacroPlan calculates separate training-day and rest-day targets from your schedule and preps around both. <a href="https://macroplan.app/signup">Try it free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'April 6, 2026',
    readTime: '6 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Calorie+Cycling',
    category: 'Nutrition'
  },
  {
    slug: 'best-foods-for-batch-cooking',
    title: 'The Best Foods for Batch Cooking (That Still Taste Good on Day 4)',
    excerpt: 'Some foods are built for the fridge. Others turn sad and rubbery by Wednesday. Here’s what to batch-cook so day-four lunch is still something you want to eat.',
    content: `
      <p>The dirty secret of meal prep is that a lot of food simply doesn't survive five days in a container. You cook a beautiful Sunday spread, and by Wednesday the chicken is dry, the broccoli is grey, and you're ordering takeout. The fix isn't more willpower — it's choosing foods that are actually built to be cooked in bulk and reheated.</p>

      <h2>Proteins That Reheat Well</h2>
      <ul>
        <li><strong>Chicken thighs:</strong> more forgiving than breast — the extra fat keeps them juicy after reheating. The single best default protein for prep.</li>
        <li><strong>Beef and turkey mince:</strong> cooked in a sauce, they reheat beautifully and absorb flavor over a few days.</li>
        <li><strong>Whole eggs and egg bites:</strong> baked egg muffins hold for days and microwave in 30 seconds.</li>
        <li><strong>Salmon:</strong> stays moist thanks to its fat content; best eaten in the first 2–3 days.</li>
        <li><strong>Pulled/slow-cooked meats:</strong> built for this — they get better as they sit.</li>
      </ul>
      <p>The protein most likely to disappoint is plain chicken breast cooked dry. If you love it, slightly undercook it, store it in its juices or a sauce, and reheat gently.</p>

      <h2>Carbs That Hold Up</h2>
      <ul>
        <li><strong>Rice:</strong> the workhorse — reheats perfectly with a splash of water (cool and refrigerate it promptly after cooking).</li>
        <li><strong>Potatoes and sweet potatoes:</strong> roast or boil; both reheat well and rank among the most filling foods per calorie.</li>
        <li><strong>Pasta:</strong> slightly undercook it so it doesn't turn to mush on reheat.</li>
        <li><strong>Oats and overnight oats:</strong> prep cold, no reheating needed.</li>
        <li><strong>Legumes:</strong> beans and lentils are nearly indestructible in the fridge and add protein and fiber.</li>
      </ul>

      <h2>Vegetables: Roast, Don't Steam</h2>
      <p>Steamed vegetables go limp and watery by day two. Roasted vegetables hold their texture far better. The champions of fridge life:</p>
      <ul>
        <li>Roasted peppers, zucchini, carrots, and red onion</li>
        <li>Roasted broccoli and cauliflower (better than steamed for storage)</li>
        <li>Hardy raw veg eaten cold — cherry tomatoes, cucumber, peppers</li>
      </ul>
      <p>Leafy greens like spinach are best added fresh at eating time rather than cooked and stored.</p>

      <blockquote>Roast your vegetables, slightly undercook your starches, and keep proteins in their juices. Those three habits are the difference between a prep you finish and one you abandon by Wednesday.</blockquote>

      <h2>Cook Once, Flavor Differently</h2>
      <p>Boredom kills meal prep faster than texture. Cook your proteins and carbs fairly plain, then change the flavor at the plate — a different sauce, spice blend, or fresh topping each day. Same batch of chicken and rice becomes a burrito bowl, a stir-fry, and a curry across the week without you cooking three times.</p>

      <h2>The Prep-Day Order</h2>
      <p>Work longest-to-shortest: get oven proteins and roasting vegetables going first, start rice and potatoes while they cook, then portion everything into containers labeled with macros. Two hours on Sunday buys you five days of food you'll actually eat. For the full workflow, see our <a href="/blog/meal-prepping-for-weight-loss">meal prep guide</a>.</p>

      <p>MacroPlan picks batch-friendly recipes that hit your macros and gives you the prep-day cooking order automatically. <a href="https://macroplan.app/signup">Generate your first prep free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'May 4, 2026',
    readTime: '7 min read',
    image: 'https://placehold.co/1200x630/0B0F10/FF6B5C?text=Best+Foods+for+Batch+Cooking',
    category: 'Meal Prep'
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
