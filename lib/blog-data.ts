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
  imageCredit?: string;
  imageCreditUrl?: string;
  category: string;
}

const TEAM_AUTHOR = 'MacroPlan Team';
const TEAM_BIO =
  'The MacroPlan team writes practical, evidence-informed guides for lifters who track macros and meal-prep their week.';
const TEAM_IMAGE =
  'https://ui-avatars.com/api/?name=MacroPlan&background=FF6B5C&color=fff&size=128';

export const blogPosts: BlogPost[] = [
  {
    slug: 'bulking-vs-cutting-vs-recomp',
    title: 'Bulking, Cutting, or Recomp? How to Pick the Right One',
    excerpt: 'Bulking, cutting, and body recomposition all build or preserve muscle differently. Here is the decision framework for picking the one that actually fits your body fat, training age, and goals.',
    content: `
      <p>Every lifter eventually asks the same question: should I bulk, cut, or just try to recomp? The honest answer depends less on which approach sounds best and more on three things you can actually measure: your current body fat, how long you've been training, and what you're optimizing for over the next several months. This guide breaks down what bulking, cutting, and body recomposition each actually do, who they fit, and how to choose without guessing.</p>

      <h2>What Bulking, Cutting, and Recomp Actually Mean</h2>
      <p>A <strong>bulk</strong> is a deliberate calorie surplus aimed at maximizing muscle growth, usually 150-300 calories above maintenance, accepting that some fat gain comes along with it. A <strong>cut</strong> is the reverse: a calorie deficit, typically 300-500 calories below maintenance, aimed at losing fat while holding onto as much muscle as training and protein allow. <strong>Body recomposition</strong> ("recomp") sits in between, eating close to maintenance while trying to lose fat and build muscle at the same time, usually through a small deficit or by cycling calories around training days.</p>
      <p>None of these three is objectively "better." They're tools for different starting points, and using the wrong one for your situation is the most common reason lifters feel like they're spinning their wheels for months without visible change.</p>

      <h2>Bulking: When It's the Right Call</h2>
      <p>Bulking makes the most sense when you're already lean (roughly under 15% body fat for men, under 25% for women) and your main goal is adding muscle and strength as fast as your training allows. A surplus gives your body the calorie headroom to build tissue without also forcing it to break down fat stores for energy, which is why lean bulks tend to produce faster strength gains and better training recovery than a cut or a maintenance-calorie recomp.</p>
      <p>The trade-off is fat gain. Even a conservative surplus adds some, and the leaner you start, the more of that early weight gain is genuinely muscle and glycogen rather than fat. Protein still matters enormously in a surplus, aim for 1.6-2.2 g per kg of bodyweight (0.7-1 g per lb), the same range that applies in a deficit, our <a href="/blog/how-much-protein-to-build-muscle">guide to protein needs for building muscle</a> covers exactly where in that range to sit. A bulk usually runs for a training block of three to six months before you shift into a cut to bring body fat back down, a cycle most competitive lifters repeat for years.</p>

      <h2>Cutting: When It's the Right Call</h2>
      <p>Cutting is the right move when body fat has climbed high enough that it's affecting how you look, feel, or perform, typically above 20% for men or 30% for women, though the number that matters most is how you personally feel about where you are. A deficit forces the body to pull energy from stored fat, and if protein and resistance training are both in place, the muscle you've already built gets preserved through the process rather than lost alongside the fat.</p>
      <p>The mechanics are the same regardless of how you got to needing a cut: a moderate deficit of 300-500 calories below maintenance, protein pushed toward the top of the 1.6-2.2 g/kg range to protect muscle under a calorie restriction, and training that keeps enough volume and intensity to signal the body that the muscle is still needed. The hardest part isn't the math, it's staying full and consistent for the weeks a cut takes, which is exactly the problem our <a href="/blog/meal-prep-on-a-cut">guide to staying full on a cut</a> is built to solve. A typical cut runs eight to sixteen weeks depending on how much fat needs to come off; sustainable rates land around 0.5-1% of bodyweight lost per week.</p>

      <h2>Body Recomposition: The Middle Path (and Its Limits)</h2>
      <p>Recomp is the option everyone wants and the one that actually works for the fewest people. Building muscle while losing fat at the same time is metabolically harder than doing either one alone, because muscle growth generally favors a surplus and fat loss favors a deficit. But it isn't a myth. A well-known 2016 study in the <a href="https://pubmed.ncbi.nlm.nih.gov/26817506/" target="_blank" rel="noopener noreferrer">American Journal of Clinical Nutrition</a> found that trained young men in a calorie deficit who ate a high protein intake (about 2.4 g/kg) and kept training hard gained lean mass while losing fat, something the lower-protein group in the same deficit didn't manage.</p>
      <p>Recomp works best for three groups: newer lifters still in their first one to two years of consistent training, anyone returning to training after a layoff (muscle memory makes regaining lost tissue easier than building it fresh), and lifters carrying enough body fat that a small deficit still leaves plenty of stored energy to draw on for recovery. If you're already lean and years into training, recomp slows to a crawl, both processes compete for the same limited resources, and a dedicated bulk or cut will get you there faster.</p>

      <h2>Bulking vs. Cutting vs. Recomp at a Glance</h2>
      <table style="width:100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="text-align:left; padding: 8px;">Approach</th>
            <th style="text-align:left; padding: 8px;">Calories</th>
            <th style="text-align:left; padding: 8px;">Best for</th>
            <th style="text-align:left; padding: 8px;">Typical length</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Bulk</td><td style="padding: 8px;">+150 to +300</td><td style="padding: 8px;">Lean, experienced lifters prioritizing muscle and strength</td><td style="padding: 8px;">3-6 months</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Cut</td><td style="padding: 8px;">-300 to -500</td><td style="padding: 8px;">Anyone whose body fat has climbed above their comfort point</td><td style="padding: 8px;">8-16 weeks</td></tr>
          <tr><td style="padding: 8px;">Recomp</td><td style="padding: 8px;">~Maintenance or a small deficit</td><td style="padding: 8px;">Newer lifters, returning lifters, higher body fat</td><td style="padding: 8px;">6-12+ months</td></tr>
        </tbody>
      </table>

      <h2>How to Decide Which One You Need</h2>
      <p>Four questions settle it for most people. How long have you been training with a real program, under two years generally means recomp is realistic; over that, muscle gain slows enough that a dedicated bulk works better. What's your current body fat, leaner favors a bulk, higher favors a cut, and anywhere in the comfortable middle leaves room for recomp. What matters more to you over the next six months, looking leaner or getting stronger, since a cut and a bulk pull in opposite directions on both fronts. And finally, have you been consistent with training and protein already, because recomp only works if both are already dialed in; if they're not, fix that first regardless of which calorie target you pick.</p>
      <p>None of these answers are permanent. Most lifters cycle through all three approaches over a training career, a beginner recomp phase, a few years of bulk-and-cut cycles, and periods of recomp again after a layoff or a plateau. Setting your macros correctly for whichever phase you're in is the part that actually matters; our <a href="/blog/decoding-macros">guide to calculating your macro ratio</a> walks through the exact numbers for a surplus, deficit, or maintenance target.</p>

      <h2>Switching Between Phases Without Losing Progress</h2>
      <p>The transition points are where most people lose the plot. Coming out of a cut, jump straight to a surplus and the first few pounds back are mostly water and glycogen refilling, not fat, so don't panic and cut again immediately. Coming out of a bulk, drop calories gradually rather than slashing them, a sudden 800-calorie cut costs you strength and energy in the gym right when you need training intensity to hold onto the muscle you just built. Keeping protein constant across every transition is the one variable that shouldn't move regardless of which phase you're entering or leaving.</p>
      <p>Whichever phase you're in, the logistics are the same: hit your number, eat enough protein, and don't rely on willpower at 8 p.m. to make it happen. <a href="https://macroplan.app">MacroPlan</a> calculates the right calorie and protein targets for a bulk, cut, or recomp and builds the week of batch-prepped food to match, so the phase you're in becomes something you eat, not something you track by hand.</p>

      <h2>FAQ</h2>
      <h3>Can beginners really build muscle and lose fat at the same time?</h3>
      <p>Yes, this is the single group recomp works best for. New training stimulus plus a body that hasn't adapted yet lets beginners gain muscle even in a slight deficit, provided protein intake and training consistency are both in place.</p>
      <h3>How do I know if I should bulk or cut first?</h3>
      <p>Body fat is the main signal. If you're already lean and want more size and strength, bulk first. If body fat has climbed enough to bother you or affect performance, cut first, then bulk from a leaner starting point afterward.</p>
      <h3>Is recomp slower than bulking or cutting?</h3>
      <p>Usually, yes, for both goals individually. A dedicated bulk builds muscle faster than a recomp does, and a dedicated cut loses fat faster. Recomp trades speed for doing both at once, which is why it suits patient, longer timelines rather than short ones.</p>
      <h3>How often should I switch between bulking and cutting?</h3>
      <p>There's no fixed schedule, most lifters run bulks of three to six months and cuts of eight to sixteen weeks, adjusting based on how body fat and strength are actually trending rather than a calendar. Individual recovery and life circumstances vary, so treat these as starting points, not rules.</p>

      <p>Whatever phase you're in, MacroPlan sets the calorie and protein target for it and builds your week of food around that number. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'July 6, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwyfHx3ZWlnaHRsaWZ0aW5nJTIwc2NhbGUlMjBmaXRuZXNzfGVufDF8MHx8fDE3ODMzMjQxNjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Victor Freitas on Unsplash",
    imageCreditUrl: "https://unsplash.com/@victorfreitas?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'protein-per-calorie-food-ranking',
    title: 'Protein Per Calorie: The Definitive Food Ranking Chart',
    excerpt: 'Total protein grams only tell half the story. This chart ranks over 30 common foods by protein delivered per 100 calories, so you can see which ones actually earn their spot in a deficit.',
    content: `
      <p>Two foods can carry the same protein number on a label and still cost you completely different amounts of your day. A 200-calorie serving of shrimp and a 200-calorie serving of salmon both look like solid choices next to each other on a menu, but one delivers close to twice the protein of the other for the same calorie hit. Once you're managing a real calorie budget, whether that's a cut, a tight maintenance target, or just trying to stay full on fewer calories, protein per calorie matters more than protein per serving. This chart ranks the foods lifters actually eat by exactly that ratio.</p>

      <h2>Why Protein Per Calorie Is the Number That Actually Matters</h2>
      <p>Most nutrition labels and recipe sites lead with grams of protein per serving, which is useful but incomplete. A 100g salmon fillet carries about 20g of protein, and a 100g chicken breast carries about 31g, so on a gram-for-gram basis chicken wins outright. But salmon also carries roughly 208 calories in that serving against chicken's 165, so the real comparison isn't the protein number alone, it's how much of your daily calorie budget you're spending to get it.</p>
      <p>That's the whole idea behind ranking foods by protein per 100 calories instead of protein per 100 grams. It answers the question that actually decides your day: if you have 300 calories left and need 35g more protein, which food gets you there? Shrimp or egg whites will close that gap almost completely. A bagel with cream cheese won't get you a fifth of the way, no matter how good it tastes.</p>
      <p>This isn't an argument that fattier proteins like salmon or whole eggs are bad choices, they carry things a chart like this doesn't capture: omega-3s, choline, and satiety from the fat itself. It's simply a tool for the specific moment when calories are the constraint and you need to know which foods stretch furthest against it.</p>

      <h2>How This Chart Was Built</h2>
      <p>Every figure below is a rounded, approximate value for a cooked or ready-to-eat serving, sourced from typical values published in the <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">USDA FoodData Central</a> database. Real-world numbers shift with cut, cooking method, and brand, a chicken thigh with skin left on carries meaningfully more fat and calories than one trimmed of it, and a lean 95% beef mince behaves very differently from an 80/20 blend. Treat the ranking as a reliable guide to which food groups win, not a substitute for checking a specific product's label when the number needs to be exact.</p>
      <p>The "protein per 100 calories" column is what the food is ranked by, higher is more protein-efficient. A food scoring 20 delivers 20g of protein for every 100 calories eaten; a food scoring 8 needs two and a half times the calorie budget to deliver the same protein.</p>

      <h2>The Full Chart</h2>
      <table style="width:100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="text-align:left; padding: 8px;">Food (cooked, 100g unless noted)</th>
            <th style="text-align:left; padding: 8px;">~Calories</th>
            <th style="text-align:left; padding: 8px;">~Protein</th>
            <th style="text-align:left; padding: 8px;">Protein / 100 cal</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Shrimp</td><td style="padding: 8px;">99</td><td style="padding: 8px;">24g</td><td style="padding: 8px;">24.2g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Egg white protein powder (per 100g powder)</td><td style="padding: 8px;">375</td><td style="padding: 8px;">84g</td><td style="padding: 8px;">22.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Tuna, canned in water</td><td style="padding: 8px;">116</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">22.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Turkey breast, skinless</td><td style="padding: 8px;">135</td><td style="padding: 8px;">30g</td><td style="padding: 8px;">22.2g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Whey protein powder (per 100g powder)</td><td style="padding: 8px;">370</td><td style="padding: 8px;">80g</td><td style="padding: 8px;">21.6g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Egg whites</td><td style="padding: 8px;">52</td><td style="padding: 8px;">11g</td><td style="padding: 8px;">21.2g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Halibut</td><td style="padding: 8px;">111</td><td style="padding: 8px;">23g</td><td style="padding: 8px;">20.7g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Crab meat</td><td style="padding: 8px;">97</td><td style="padding: 8px;">20g</td><td style="padding: 8px;">20.6g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Tilapia</td><td style="padding: 8px;">128</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">20.3g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Rabbit</td><td style="padding: 8px;">173</td><td style="padding: 8px;">33g</td><td style="padding: 8px;">19.1g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Venison</td><td style="padding: 8px;">158</td><td style="padding: 8px;">30g</td><td style="padding: 8px;">19.0g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Chicken breast, skinless</td><td style="padding: 8px;">165</td><td style="padding: 8px;">31g</td><td style="padding: 8px;">18.8g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Bison</td><td style="padding: 8px;">152</td><td style="padding: 8px;">28g</td><td style="padding: 8px;">18.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Pork tenderloin</td><td style="padding: 8px;">143</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">18.2g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Scallops</td><td style="padding: 8px;">111</td><td style="padding: 8px;">20g</td><td style="padding: 8px;">18.0g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Clams</td><td style="padding: 8px;">148</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">17.6g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Seitan</td><td style="padding: 8px;">120</td><td style="padding: 8px;">21g</td><td style="padding: 8px;">17.5g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Skyr</td><td style="padding: 8px;">63</td><td style="padding: 8px;">11g</td><td style="padding: 8px;">17.5g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Greek yogurt, 0%</td><td style="padding: 8px;">59</td><td style="padding: 8px;">10g</td><td style="padding: 8px;">17.0g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Cottage cheese, fat-free</td><td style="padding: 8px;">72</td><td style="padding: 8px;">12g</td><td style="padding: 8px;">16.7g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Beef, eye of round</td><td style="padding: 8px;">183</td><td style="padding: 8px;">29g</td><td style="padding: 8px;">15.8g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Beef mince, 95% lean</td><td style="padding: 8px;">172</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">15.1g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Pork loin chop</td><td style="padding: 8px;">197</td><td style="padding: 8px;">27g</td><td style="padding: 8px;">13.7g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Chicken thigh, skinless</td><td style="padding: 8px;">209</td><td style="padding: 8px;">26g</td><td style="padding: 8px;">12.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Cottage cheese, 2%</td><td style="padding: 8px;">90</td><td style="padding: 8px;">11g</td><td style="padding: 8px;">12.2g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Tempeh</td><td style="padding: 8px;">192</td><td style="padding: 8px;">20g</td><td style="padding: 8px;">10.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Tofu, extra-firm</td><td style="padding: 8px;">144</td><td style="padding: 8px;">15g</td><td style="padding: 8px;">10.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Edamame</td><td style="padding: 8px;">121</td><td style="padding: 8px;">12g</td><td style="padding: 8px;">9.9g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Salmon</td><td style="padding: 8px;">208</td><td style="padding: 8px;">20g</td><td style="padding: 8px;">9.6g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Eggs, whole</td><td style="padding: 8px;">155</td><td style="padding: 8px;">13g</td><td style="padding: 8px;">8.4g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Lentils</td><td style="padding: 8px;">116</td><td style="padding: 8px;">9g</td><td style="padding: 8px;">7.8g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Split peas</td><td style="padding: 8px;">118</td><td style="padding: 8px;">8.3g</td><td style="padding: 8px;">7.0g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Black beans</td><td style="padding: 8px;">132</td><td style="padding: 8px;">8.9g</td><td style="padding: 8px;">6.7g</td></tr>
          <tr><td style="padding: 8px;">Chickpeas</td><td style="padding: 8px;">164</td><td style="padding: 8px;">8.9g</td><td style="padding: 8px;">5.4g</td></tr>
        </tbody>
      </table>

      <h2>What Actually Stands Out in the Data</h2>
      <p>Seafood dominates the top of this list for a simple reason: shrimp, crab, cod, halibut, and tilapia are all naturally very low in fat, so almost every calorie in the serving is coming from protein rather than being padded out by fat's 9 calories per gram. Shrimp in particular is one of the most protein-dense foods available at any price point, and it cooks in under five minutes, which makes it worth keeping in the freezer specifically for the days your calories are tight and your protein target isn't met yet.</p>
      <p>Poultry breast and lean cuts of red meat sit in a strong second tier, and this is where a detail worth remembering shows up clearly: skin and fat trimming move a food a long way up or down this chart without changing the protein number at all. A skinless chicken breast scores 18.8g of protein per 100 calories; the same bird with the skin left on and a thigh cut instead of breast drops into the 12s. If you're deciding between chicken breast and chicken thigh for a specific meal, the deciding factor isn't which one is "healthier," it's whether that meal needs to be calorie-efficient or whether you have room to spend on a fattier cut for the flavor and moisture it brings. Our <a href="/blog/best-protein-for-meal-prep">chicken vs. beef vs. salmon comparison</a> goes deeper on that trade-off for a full week of prep.</p>
      <p>Dairy tells a similarly clean story. Fat-free cottage cheese, 0% Greek yogurt, and skyr all cluster in the high teens, while whole-fat versions of the same foods drop noticeably once the fat is added back in. None of this makes full-fat dairy the wrong choice, fat has its own role in a diet, it just means the protein-per-calorie chart is specifically answering "which version stretches my calories furthest," not "which version is better for me."</p>
      <p>Plant-based proteins land in the middle of the pack rather than the bottom, which surprises people who assume animal protein always wins this comparison. Seitan is the standout, scoring competitively with lean meat because it's essentially concentrated wheat gluten with very little fat or carbohydrate diluting the calorie count. Tofu, tempeh, and edamame sit lower, not because they're poor protein sources, but because legume-based foods carry meaningful carbohydrate and fat alongside their protein, which is a feature for a balanced diet, not a flaw. Lentils, beans, and chickpeas rank lowest on this specific ranking while still being genuinely useful protein sources once you account for the fiber and micronutrients they bring that nothing at the top of this list does.</p>
      <p>Whole eggs and salmon are worth calling out because their position here can be misleading if you read the chart as a verdict rather than a tool. Both score in the middle to low range purely because of their fat content, but that fat is doing real work: choline and cholesterol-related nutrients in the yolk, and omega-3s in the salmon, neither of which shows up in a protein-per-calorie number. Egg whites and salmon aren't competitors, they're different tools, use egg whites when calories are the constraint and whole eggs when they aren't.</p>

      <h2>Putting the Chart to Work</h2>
      <p>The chart is most useful in one specific moment: you're partway through a day, you know roughly how many calories and how much protein you have left, and you need to pick the food that closes the gap without blowing the budget. On a tight cut, that usually means reaching for something from the top third of this list, shrimp, white fish, egg whites, or a lean poultry cut, especially late in the day when the calorie room left is smaller than the protein room left. Our <a href="/blog/meal-prep-on-a-cut">guide to staying full while cutting</a> covers the same principle applied to a full week of meals rather than a single food choice.</p>
      <p>On a maintenance or lean bulk, the calculation flips, calories aren't the constraint, so foods lower on this list, salmon, whole eggs, beef mince with more fat left in, become perfectly reasonable choices again, and often the more satisfying and nutritionally rounded ones. The chart isn't telling you to eat shrimp and egg whites forever, it's telling you which lever to pull on the specific days when calories are genuinely tight. If you haven't set the protein target this chart is meant to help you hit, our <a href="/blog/how-much-protein-to-build-muscle">guide to how much protein you actually need</a> covers the number itself, and <a href="/blog/decoding-macros">calculating your full macro split</a> covers where that protein target fits alongside carbs and fat.</p>
      <p>If you'd rather not do this math meal by meal, <a href="https://macroplan.app">MacroPlan</a> builds your week of batch-prepped food around your exact protein and calorie targets, choosing the protein sources that fit the budget automatically instead of leaving it to a chart at 8 p.m.</p>

      <h2>FAQ</h2>
      <h3>Is a higher protein-per-calorie score always better?</h3>
      <p>Not universally, it depends on your situation. It's the right lens when calories are genuinely limited, cutting, a tight maintenance target, or closing a protein gap late in the day. When calories aren't the constraint, a food's fat content, micronutrients, and how filling or enjoyable it is matter more than this one ratio.</p>
      <h3>Why does salmon rank lower than chicken breast if both are considered lean proteins?</h3>
      <p>Salmon isn't actually lean in the way chicken breast is, it carries roughly 13g of fat per 100g against chicken breast's 3.6g. That fat brings real benefits, mainly omega-3s, but it also means more of salmon's calories come from fat rather than protein, which is exactly what this ranking measures.</p>
      <h3>Are plant-based proteins worse for a calorie-limited diet?</h3>
      <p>Not worse, just positioned differently. Seitan competes directly with lean meat on this metric, while legumes rank lower mainly because they carry useful carbohydrate and fiber alongside their protein. If you're building a plant-based diet around a tight calorie budget, seitan, tofu, and tempeh combined with a protein powder for gaps is a workable strategy.</p>
      <h3>Should I only eat foods from the top of this chart?</h3>
      <p>No. A diet built entirely from the top of this list would be low in fat-soluble nutrients and would get monotonous fast. Use the top of the chart to solve a specific problem, protein you still need with calories running low, not as a template for every meal of the week.</p>

      <p>Save the math and let MacroPlan pick the right proteins for your targets automatically. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'July 4, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1618666185561-baed3459ff18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwyfHxsZWFuJTIwcHJvdGVpbiUyMGNoaWNrZW4lMjBlZ2dzJTIwZmlzaCUyMHBsYXRlfGVufDF8MHx8fDE3ODMxNTEzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Nick Kimel on Unsplash",
    imageCreditUrl: "https://unsplash.com/@nickkimel?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'macro-friendly-fast-food-guide',
    title: 'The Macro-Friendly Fast Food Guide: What to Order at 13 Chains',
    excerpt: 'A definitive, chain-by-chain reference for eating fast food without wrecking your macros, with approximate protein and calories for the order that actually works.',
    content: `
      <p>Meal prep breaks down on a normal week more often than anyone admits. A late meeting eats your lunch, a road trip strands you at a rest stop, or the container you packed gets left in the office fridge on a Friday. None of that has to blow a cut or a bulk. Fast food menus have quietly gotten more protein-friendly over the last few years, and once you know which order to give at the register, a drive-thru stop can look almost identical on paper to a home-cooked meal. This is the reference to keep bookmarked for exactly that day.</p>

      <h2>Why Fast Food Doesn't Have to Wreck Your Macros</h2>
      <p>The problem was never the restaurant, it was the default order. A combo meal is built to sell you a bun, a large fry, and a 20-ounce soda, three items that add hundreds of calories and almost no protein. Swap those defaults and the same kitchen can put out a meal that looks a lot like something you'd portion into a container yourself: a lean protein, a controlled carb, and minimal added fat from sauces and frying oil.</p>
      <p>The other piece is math you can do standing at the counter. Grilled beats fried almost every time, because breading and the fryer add fat calories without adding protein. Skipping or downsizing the bun trims 150 to 250 calories while leaving the protein untouched. And sauces are where a lot of the damage hides, a single packet of mayo-based sauce can run 100 to 200 calories for basically zero nutritional return, so asking for it on the side and using half is worth more than most people expect.</p>

      <h2>The Four Rules That Cover Almost Every Menu</h2>
      <p>You don't need to memorize thirteen separate strategies. Almost every macro-friendly order on this list comes from applying the same four moves:</p>
      <ul>
        <li><strong>Pick grilled, roasted, or plain over fried or crispy.</strong> Same protein source, far less added fat.</li>
        <li><strong>Drop or halve the bun, tortilla, or bread.</strong> The protein and toppings stay, the empty carbs go.</li>
        <li><strong>Ask for sauce on the side, then use less than you think you need.</strong> Most sauces are fat-based and calorie-dense relative to their portion size.</li>
        <li><strong>Swap fries for a side salad, fruit cup, or nothing.</strong> This is usually the single biggest calorie swing on the whole ticket.</li>
      </ul>
      <p>Apply those four moves and you can walk into almost any chain in this guide and leave with something that fits a real macro target, no nutrition app required at the counter.</p>

      <h2>Chain by Chain: What to Order</h2>
      <p>These figures are rounded estimates based on typical published nutrition information and vary by region, recipe updates, and how the location actually portions things. Chains update menus and formulas often, so treat this as a starting point and check the chain's own nutrition calculator if you're dialing in something precise, the same way you'd double-check a recipe before trusting it in a <a href="/blog/decoding-macros">macro calculation</a>.</p>

      <table style="width:100%; border-collapse: collapse; margin: 1.5rem 0;">
        <thead>
          <tr style="border-bottom: 2px solid #ddd;">
            <th style="text-align:left; padding: 8px;">Chain</th>
            <th style="text-align:left; padding: 8px;">Order</th>
            <th style="text-align:left; padding: 8px;">~Calories</th>
            <th style="text-align:left; padding: 8px;">~Protein</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Chipotle</td><td style="padding: 8px;">Chicken or steak burrito bowl, double protein, no rice, extra fajita veg</td><td style="padding: 8px;">520</td><td style="padding: 8px;">60g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Chick-fil-A</td><td style="padding: 8px;">Grilled chicken sandwich, no bun, side salad</td><td style="padding: 8px;">280</td><td style="padding: 8px;">35g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">McDonald's</td><td style="padding: 8px;">Quarter Pounder, no bun, sauce on the side</td><td style="padding: 8px;">340</td><td style="padding: 8px;">28g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Wendy's</td><td style="padding: 8px;">Grilled chicken sandwich, no bun, plain baked potato</td><td style="padding: 8px;">430</td><td style="padding: 8px;">38g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Taco Bell</td><td style="padding: 8px;">Power Menu Bowl, chicken, no cheese/sour cream</td><td style="padding: 8px;">400</td><td style="padding: 8px;">28g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Subway</td><td style="padding: 8px;">Rotisserie chicken or turkey, 6-inch, no cheese, double meat</td><td style="padding: 8px;">380</td><td style="padding: 8px;">36g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Five Guys</td><td style="padding: 8px;">Bacon burger, lettuce wrap (no bun)</td><td style="padding: 8px;">520</td><td style="padding: 8px;">33g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">In-N-Out</td><td style="padding: 8px;">Double-Double, "protein style" (lettuce wrap)</td><td style="padding: 8px;">490</td><td style="padding: 8px;">27g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Panera</td><td style="padding: 8px;">Green Goddess Cobb salad with chicken, half portion of dressing</td><td style="padding: 8px;">380</td><td style="padding: 8px;">32g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Panda Express</td><td style="padding: 8px;">String bean chicken breast, double, no rice</td><td style="padding: 8px;">340</td><td style="padding: 8px;">36g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Jimmy John's</td><td style="padding: 8px;">Turkey Tom, unwich (lettuce wrap instead of bread)</td><td style="padding: 8px;">240</td><td style="padding: 8px;">25g</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px;">Starbucks</td><td style="padding: 8px;">Egg white and roasted red pepper egg bites, plus a protein box</td><td style="padding: 8px;">470</td><td style="padding: 8px;">33g</td></tr>
          <tr><td style="padding: 8px;">Popeyes</td><td style="padding: 8px;">Blackened chicken tenders (not fried), red beans and rice on the side</td><td style="padding: 8px;">420</td><td style="padding: 8px;">34g</td></tr>
        </tbody>
      </table>

      <h3>Chipotle</h3>
      <p>Chipotle is close to a cheat code for this list because it's built like a build-your-own container. Ask for a burrito bowl with double chicken or steak, skip the rice or ask for half, and load up on the fajita vegetables and salsa, which cost almost nothing in calories. Guacamole is the one add-on worth budgeting for separately, it's healthy fat but it's dense, so decide in advance whether it fits your remaining fat for the day rather than defaulting to it.</p>

      <h3>Chick-fil-A</h3>
      <p>The grilled chicken sandwich, ordered without the bun, is one of the cleanest fast food orders that exists. Ask for it as a "grilled chicken, no bun" and it comes out closer to a chicken breast on a plate than a sandwich. Pair it with the side salad instead of waffle fries and you've got a meal a nutrition coach wouldn't blink at.</p>

      <h3>McDonald's</h3>
      <p>The Quarter Pounder without the bun keeps the beef patty, cheese, and toppings while cutting the two halves of a white bun that add carbs without much else. It won't be the most exciting order on this list, but it's fast, it's everywhere, and the protein number holds up. Ask for extra pickles or onion if you want more volume without more calories.</p>

      <h3>Taco Bell</h3>
      <p>The Power Menu Bowl with chicken is Taco Bell's own attempt at a macro-friendly build, and it mostly works once you drop the cheese and sour cream, which is where most of the fat hides. What's left is seasoned chicken, beans, rice, and lettuce, a reasonable protein-and-carb base for a training day.</p>

      <h3>Subway</h3>
      <p>Subway rewards the double-meat option more than almost any other chain on this list, because the bread is the only real problem with a Subway sandwich and doubling the protein shifts the ratio in your favor without changing the order at all. Rotisserie-style chicken or turkey breast on a 6-inch with no cheese and double meat gets you a genuinely solid protein-to-calorie ratio for a sandwich chain.</p>

      <h3>Wendy's</h3>
      <p>The grilled chicken sandwich without the bun is Wendy's version of the Chick-fil-A play, and it holds up just as well. The plain baked potato is the underrated side here, it's a whole food, high in potassium, and far more filling per calorie than fries, the same logic behind favoring potatoes in a <a href="/blog/meal-prep-on-a-cut">high-volume, low-calorie meal prep</a>.</p>

      <h2>When the Menu Hack Isn't Enough</h2>
      <p>None of this replaces a real meal prep habit, and it isn't supposed to. A modified fast food order is a stopgap for the day the plan falls apart, not a long-term substitute for cooking your own food. The sodium on most of these orders runs high even after the swaps, the vegetables are minimal, and doing this three or four times a week instead of once will cost you more than the calorie count on the receipt shows. Treat this guide as insurance, not a rotation.</p>
      <p>If you find yourself reaching for this list more than once or twice a week, that's usually a sign the actual problem is upstream, not enough prepped food in the fridge on the days that matter. Building a target you can hit consistently, the way we cover in <a href="/blog/how-much-protein-to-build-muscle">how much protein you actually need</a>, still does more for you long term than any drive-thru order ever will.</p>

      <h2>FAQ</h2>
      <h3>Is fast food really compatible with cutting?</h3>
      <p>Yes, in moderation. A modified order like the ones above can fit inside a calorie deficit the same way any other meal can, the deficit comes from your total daily intake, not from where the food was cooked. The bigger risk on a cut is the sodium and the ease of over-ordering sides, not the protein source itself.</p>
      <h3>Are these calorie and protein numbers exact?</h3>
      <p>No, treat them as reasonable estimates. Chains change suppliers, recipes, and portion sizes, and a location can prepare the same menu item slightly differently. For a number you're going to rely on precisely, check the chain's official nutrition calculator before you order.</p>
      <h3>What's the single biggest mistake people make ordering "healthy" fast food?</h3>
      <p>Keeping the sauce. A grilled chicken sandwich with the bun removed can still carry 200-plus calories of mayo-based sauce that adds nothing but fat. Asking for it on the side and using a fraction of the packet fixes more of the order than the bun swap does.</p>
      <h3>Is it better to skip fast food entirely on a diet?</h3>
      <p>Not necessarily. A diet that can't survive contact with real life, meetings, travel, a bad week, tends to fail faster than one with a built-in plan for those moments. Individual situations vary, and if fast food is a daily habit rather than an occasional stopgap, that's worth a closer look with a professional.</p>

      <p>The real fix for the day meal prep falls apart is having a plan that's easier to stick to in the first place. MacroPlan builds your week around your actual protein and calorie targets so the fridge, not the drive-thru, is the easy option. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'July 3, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwyfHxmYXN0JTIwZm9vZCUyMGJ1cmdlciUyMGhlYWx0aHl8ZW58MXwwfHx8MTc4MzA2NzkwOXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Haseeb Jamil on Unsplash",
    imageCreditUrl: "https://unsplash.com/@haseebjkhan?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'high-protein-snacks-under-200-calories',
    title: '11 High-Protein Snacks Under 200 Calories (For Between Meals)',
    excerpt: 'Eleven snacks that deliver serious protein for well under 200 calories each, with macros listed so hitting your target between meals stops being a guess.',
    content: `
      <p>Most people hit their protein target at meals and then quietly lose the whole day between them. A snack that's just carbs or fat doesn't move the number that actually matters for a lifter, and by dinner you're staring down 60g still to eat with one meal left to eat it in. The fix isn't eating more often, it's picking snacks built around protein instead of whatever's closest to hand. Here are eleven that clear at least 14g of protein for under 200 calories, with the macros included so you can slot them straight into your day.</p>

      <h2>Why the Snack Matters as Much as the Meal</h2>
      <p>Protein spread across the day works better than protein crammed into two big meals. Muscle protein synthesis responds to regular doses of amino acids, roughly every three to four hours, so a snack that skips protein entirely is a wasted window rather than a neutral one. It's also the easiest place a day quietly goes sideways: a bag of chips or a candy bar between lunch and dinner adds 200-plus calories and does nothing for the number you're actually trying to hit.</p>
      <p>The other reason snacks matter is timing. Most people aren't hungry enough at 3 p.m. to eat a full meal, but they are hungry enough to eat badly if nothing better is within reach. A protein-forward snack fills that gap without derailing the rest of the day's macros, which is exactly the problem it needs to solve.</p>

      <h2>What Makes a Snack Actually Work</h2>
      <p>A good snack does three things: it delivers a meaningful dose of protein (aim for 15g or more), it doesn't quietly cost you 400 calories, and it's fast enough that you'll actually make it instead of grabbing whatever's in the vending machine. A few habits make that easier:</p>
      <ul>
        <li><strong>Keep protein sources visible.</strong> String cheese and yogurt cups at eye level in the fridge get eaten; ones buried behind leftovers don't.</li>
        <li><strong>Portion in advance.</strong> Pre-bagged nuts or pre-cut cheese sticks remove the decision that turns "a handful" into half the bag.</li>
        <li><strong>Pair, don't stack.</strong> One protein source plus one piece of fruit or a few crackers beats grazing on three different things until you've lost count.</li>
      </ul>

      <h2>1. Cottage Cheese with Cinnamon and Berries</h2>
      <p>150g of low-fat cottage cheese with a shake of cinnamon and 80g of berries turns a fridge staple into something you'd actually choose over a granola bar. Cottage cheese is mostly casein, a slow-digesting protein that keeps you full for longer than a whey shake of the same size. <strong>~180 cal, 21g protein.</strong></p>

      <h2>2. Two Eggs and a Rice Cake</h2>
      <p>Hard-boil a batch on Sunday and this becomes a 30-second snack all week. Two eggs plus a lightly salted rice cake gives you protein, a bit of crunch, and almost no cleanup. <strong>~170 cal, 15g protein.</strong></p>

      <h2>3. Greek Yogurt with a Scoop of Whey</h2>
      <p>150g of 0% Greek yogurt mixed with half a scoop of whey turns an already decent snack into one of the highest protein-per-calorie options on this list. Stir it in dry or with a splash of water, it dissolves fine without a shaker. <strong>~150 cal, 27g protein.</strong></p>

      <h2>4. Turkey and Light Cheese Roll-Ups</h2>
      <p>Wrap three slices of deli turkey around a stick of light mozzarella or cheddar. No prep beyond opening two packages, and it travels well in a lunch bag without needing to be kept perfectly cold for long. <strong>~150 cal, 22g protein.</strong></p>

      <h2>5. Edamame in the Pod</h2>
      <p>A steamed 155g serving of edamame, still in the pod, is one of the few plant-based snacks that gets close to 20g of protein on its own. The pod also slows you down, which is a quiet advantage when the goal is a snack, not a second lunch. <strong>~190 cal, 17g protein.</strong></p>

      <h2>6. Tuna Packet and Whole-Grain Crackers</h2>
      <p>A single 85g pouch of tuna in water, eaten straight or with six whole-grain crackers, is one of the most portable options here. It needs no refrigeration until opened, which makes it the desk-drawer or gym-bag backup for the day you didn't plan ahead. <strong>~170 cal, 24g protein.</strong></p>

      <h2>7. A Straight Whey Shake</h2>
      <p>One scoop of whey in water or unsweetened almond milk over ice is the fastest item on this list, and often the cheapest per gram of protein. It won't fill you up the way a solid food does, so it works best right before or after training rather than as your only afternoon snack. <strong>~120 cal, 24g protein.</strong></p>

      <h2>8. Beef Jerky</h2>
      <p>A single 28g bag of beef jerky is dense, portable, and needs zero prep, which makes it the obvious car or travel option. It runs high in sodium, so it's a better fit on a training day than stacked with an already salty dinner. <strong>~90 cal, 14g protein.</strong></p>

      <h2>9. Skyr with Honey</h2>
      <p>Skyr is an Icelandic dairy product that's strained even further than Greek yogurt, so it packs more protein per calorie. A 170g cup with a small drizzle of honey reads like dessert while doing the job of a serious snack. <strong>~130 cal, 19g protein.</strong></p>

      <h2>10. Smoked Salmon on a Rice Cake</h2>
      <p>50g of smoked salmon over two lightly salted rice cakes is the snack that doesn't feel like a diet food. It's higher effort than most of this list, but it's ready in under two minutes and brings omega-3s that the rest of these options don't. <strong>~150 cal, 14g protein.</strong></p>

      <h2>11. String Cheese and Turkey Pepperoni</h2>
      <p>Two string cheese sticks and a small handful of turkey pepperoni slices is the snack-drawer answer to a charcuterie board, no cutting board required. It's shelf-stable enough for a desk drawer and filling enough to actually hold you to dinner. <strong>~190 cal, 20g protein.</strong></p>

      <h2>Building These Into Your Week</h2>
      <p>None of these need a recipe, which is the point, a snack that requires cooking usually doesn't get made. The bigger lever is having two or three of these already in the fridge or pantry before 3 p.m. hits, the same logic behind <a href="/blog/meal-prepping-for-weight-loss">prepping your main meals on Sunday</a>. If protein has been the macro you consistently fall short on, our guide to <a href="/blog/how-much-protein-to-build-muscle">how much protein you actually need</a> covers the daily target these snacks are meant to help you close.</p>
      <p>Research on satiety backs up why protein-forward snacks work better than reaching for whatever's nearest: in <a href="https://pubmed.ncbi.nlm.nih.gov/7498104/" target="_blank" rel="noopener noreferrer">Holt et al.'s classic satiety index study</a>, high-protein foods consistently outperformed carbohydrate- and fat-heavy options for keeping people full per calorie. That's a big part of why a 150-calorie cottage cheese snack holds hunger off longer than a 150-calorie handful of crackers.</p>

      <h2>FAQ</h2>
      <h3>How many snacks should I eat in a day?</h3>
      <p>Most lifters do fine with one or two, placed wherever the gap between meals is longest. There's no magic number, the goal is closing your daily protein target without adding calories you didn't plan for.</p>
      <h3>Are protein bars a good snack?</h3>
      <p>Some are, but check the label rather than the marketing. Many "protein" bars are closer to a candy bar with 10g of protein bolted on. Anything on this list gets you more protein per calorie than most packaged bars, and usually costs less.</p>
      <h3>Can I hit my protein target with snacks alone, without tracking every meal?</h3>
      <p>Yes, if the snacks are consistent. Once you know a Greek yogurt and whey combo is always 27g, eating it stops being something you need to log, the same logic behind <a href="/blog/stop-tracking-macros-burnout">structuring your diet instead of tracking every gram</a>.</p>
      <h3>What's the best snack before a workout?</h3>
      <p>Something protein-forward and easy to digest: a whey shake, Greek yogurt, or two eggs and a rice cake all work well 30 to 60 minutes out. Save the higher-fiber options like edamame for after training instead.</p>

      <p>MacroPlan builds your snacks in around your daily targets, not just your three main meals. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'July 2, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1477506350614-fcdc29a3b157?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwzfHxoaWdoJTIwcHJvdGVpbiUyMHNuYWNrc3xlbnwxfDB8fHwxNzgyOTkzOTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Rachael Gorjestani on Unsplash",
    imageCreditUrl: "https://unsplash.com/@rachaelgorjestani?utm_source=MacroPlan&utm_medium=referral",
    category: 'Recipes'
  },
  {
    slug: 'glp-1-muscle-loss-protein-resistance-training',
    title: 'GLP-1 Weight Loss Is Costing You Muscle: What the 2025-2026 Research Says to Do',
    excerpt: 'New research shows GLP-1 medications like Ozempic and Zepbound can strip 10-15% of lean mass during a big weight loss. Here is what the studies say actually prevents it.',
    content: `
      <p>GLP-1 medications (semaglutide, tirzepatide, the drugs sold as Ozempic, Wegovy, Mounjaro, and Zepbound) produce weight loss numbers that were rare before pharmacology got involved. But a growing body of 2025 and 2026 research has been quietly raising a less flattering number alongside it: how much of that lost weight is muscle, not fat. For lifters using these medications, or coached clients who are, this is the number that actually matters.</p>

      <h2>What the Research Found</h2>
      <p>A <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC13090617/" target="_blank" rel="noopener noreferrer">systematic review of GLP-1 receptor agonists and muscle outcomes</a> documents what clinicians have been observing for a while: in patients who lose more than about 15% of body weight on high-dose GLP-1 therapy, lean mass declines by roughly 10-15% on average. That's a meaningfully different outcome than fat loss with training, where lean mass is typically preserved or even gained.</p>
      <p>The mechanisms line up with what you'd expect from rapid, appetite-suppressed weight loss: protein intake quietly falls below the 1.2-1.6 g/kg/day floor needed to spare muscle, lower insulin and higher glucagon signaling tilt metabolism toward breakdown, and the fatigue some people feel on these drugs means fewer and lighter training sessions, right when training matters most.</p>

      <blockquote>Weight loss on a GLP-1 isn't automatically fat loss. Without a deliberate protein and training plan, a meaningful chunk of the number on the scale is muscle, and muscle doesn't come back just because the drug worked.</blockquote>

      <h2>The Intervention That Changed the Outcome</h2>
      <p>The more useful finding from the 2025 research isn't the problem, it's what fixed it. A prospective six-month study of 200 adults starting semaglutide or tirzepatide gave one group structured education on resistance training and protein intake at the start of treatment. That group lost about 13% of body weight but only around 3% of muscle mass, a fraction of the lean-mass loss seen without the intervention. Supervised resistance and aerobic training paired with roughly 1.2-1.6 g/kg/day of protein was enough to preserve nearly all of it (<a href="https://www.medscape.com/viewarticle/resistance-training-protein-may-lower-glp-1-ra-muscle-loss-2025a10008x6" target="_blank" rel="noopener noreferrer">Medscape's coverage of the data</a>).</p>
      <p>That's not a surprising mechanism if you already train. It's the same principle that protects muscle in any calorie deficit: a high protein intake plus a resistance training stimulus tells the body there's a reason to keep the tissue. GLP-1 medications don't remove that logic, they just make the deficit larger and the appetite cues quieter, which makes it easier to under-eat protein without noticing.</p>

      <h2>What This Means If You're Lifting on a GLP-1</h2>
      <p>The clinical floor of 1.2-1.6 g/kg/day comes from general obesity-medicine guidance, not from sports nutrition research, and it's lower than what most lifters should be targeting. If you're training seriously, use the lifter range instead: <strong>1.6-2.2 g/kg of bodyweight per day</strong>, the same target that applies to anyone in a calorie deficit. Our <a href="/blog/how-much-protein-to-build-muscle">protein requirements guide</a> breaks down where in that range to sit. Appetite suppression is the practical obstacle: when food sounds unappealing, protein is usually the first macro to slip, so front-loading it earlier in the day when appetite is highest helps close the gap.</p>
      <p>Resistance training matters as much as the protein number. Two to three full-body sessions a week, hitting the major muscle groups with a few hard sets each, is enough to give the body a reason to hold onto lean tissue during a deficit. This isn't the moment to switch to long cardio sessions because eating less feels effortless; cardio burns more of the deficit but does little to protect muscle compared to resistance work.</p>

      <h2>Why Meal Prep Solves the Hardest Part of This</h2>
      <p>The actual failure point for most people on a GLP-1 isn't motivation, it's that appetite suppression makes eating feel like a chore, and a chore gets skipped or under-portioned. That's exactly the scenario batch-prepped, pre-portioned meals are built for: a labeled container with a known protein number removes the decision of what and how much to eat when food doesn't sound appealing. Our <a href="/blog/meal-prep-on-a-cut">guide to staying full and protein-adequate on a cut</a> covers the same volume-and-protein logic that applies here, deficit is deficit, regardless of what's driving it.</p>
      <p>If you're new to structuring a week of food around a protein target rather than logging every gram, the <a href="/blog/meal-prepping-for-weight-loss">Sunday meal prep system</a> is the starting point, and <a href="https://macroplan.app">MacroPlan</a> will set the calorie and protein numbers for you and build the week of food to hit them.</p>

      <h2>FAQ</h2>
      <h3>How much muscle do you actually lose on Ozempic or Zepbound?</h3>
      <p>Research on patients losing more than 15% of body weight on high-dose GLP-1 therapy shows lean mass declines of roughly 10-15% on average without intervention. Individual results vary by dose, starting body composition, age, and whether resistance training and adequate protein are part of the plan.</p>
      <h3>How much protein should I eat on a GLP-1 medication if I lift weights?</h3>
      <p>General clinical guidance for GLP-1 patients is 1.2-1.6 g/kg/day, but that's a floor for the general population, not lifters. If you're training, aim for 1.6-2.2 g/kg/day, the same range recommended for anyone losing weight while trying to preserve muscle.</p>
      <h3>Does resistance training really prevent muscle loss on these medications?</h3>
      <p>The available 2025 data is encouraging: a structured program combining resistance training with adequate protein cut lean-mass loss to roughly 3% of bodyweight, versus 10-15% lean-mass loss reported in less-supported weight loss on the same class of drugs. It doesn't eliminate the risk, but it changes the outcome substantially.</p>
      <h3>Should I stop training cardio if I'm on a GLP-1 and trying to keep muscle?</h3>
      <p>Not stop, but don't let it replace resistance training. Cardio supports the calorie deficit and heart health; resistance training is the specific stimulus that tells the body to keep muscle. If time or energy is limited, prioritize two to three resistance sessions a week first.</p>
      <p>This is a fast-moving area of research, and GLP-1 medications carry their own risks and side effects. Talk to your prescribing doctor about your individual protein and exercise plan, this article isn't a substitute for that conversation.</p>

      <p>Whatever is driving your deficit, MacroPlan sets a protein target that protects muscle and builds the week of prepped food to hit it. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'June 30, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1758875568800-29fb434c7b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfGFsbHx8fHx8fHx8fDE3ODI4MDMyNDR8&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Vitaly Gariev on Unsplash",
    imageCreditUrl: "https://unsplash.com/@silverkblack?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'ultimate-guide-to-flexible-dieting',
    title: 'The Ultimate Guide to Flexible Dieting and Macro Tracking',
    excerpt: 'Flexible dieting lets you hit your macros without banning foods. This guide covers calculating targets, tracking accurately, and making IIFYM stick long term.',
    content: `
      <p>Flexible dieting, usually called <strong>"If It Fits Your Macros" (IIFYM)</strong>, is a nutrition approach built on one idea: your body composition responds to your total calories and macronutrients, not to whether a specific food is on an approved list. Hit your protein, carb, and fat targets, and you can build the day from foods you actually want to eat. This guide covers how flexible dieting works, how to set your numbers, and how to track without letting it take over your life.</p>

      <h2>What Are Macros?</h2>
      <p>Macronutrients are the three nutrients your body needs in large amounts, and each carries a fixed calorie value:</p>
      <ul>
        <li><strong>Protein</strong>, 4 calories per gram. Drives muscle repair, growth, and satiety. The macro lifters under-eat most often.</li>
        <li><strong>Carbohydrates</strong>, 4 calories per gram. Your primary training fuel; refills the glycogen hard sessions drain.</li>
        <li><strong>Fat</strong>, 9 calories per gram. Supports hormone production and vitamin absorption. Needs a floor, not a ceiling of zero.</li>
      </ul>
      <p>Because each macro has a fixed calorie value, a macro target is also a calorie target. Hit 180g protein, 250g carbs, and 70g fat and you've eaten about 2,350 calories whether that came from chicken and rice or from a burrito.</p>

      <h2>Flexible Dieting vs. Clean Eating</h2>
      <p>The traditional alternative is "clean eating": a list of approved foods and a longer list of banned ones. It can work, but it tends to fail in a specific way, the banned list makes every social event a test, and one slice of pizza becomes a failed diet instead of 400 calories that fit fine.</p>
      <p>Flexible dieting removes the moral layer. There are no good or bad foods, just foods with different macro profiles and different levels of usefulness for your goal. In practice most successful flexible dieters land on something like an 80/20 split: mostly whole foods because they're filling and nutrient-dense, with a deliberate margin for the foods that make eating enjoyable.</p>

      <blockquote>A diet you can hold for six months beats a perfect diet you abandon in three weeks. Flexibility is not a loophole, it's the mechanism that makes the results stick.</blockquote>

      <h2>How to Calculate Your Macros</h2>
      <p>You can get a baseline in four steps:</p>
      <ul>
        <li><strong>1. Estimate maintenance calories.</strong> Bodyweight in kg × 22, multiplied by an activity factor (1.4–1.6 for most lifters training 3–5x/week), gets you close. An 80 kg (176 lb) lifter lands around 2,600–2,800 calories.</li>
        <li><strong>2. Adjust for your goal.</strong> Subtract 300–500 calories for a cut; add 150–300 for a lean bulk; leave it alone for maintenance.</li>
        <li><strong>3. Set protein first.</strong> 1.6–2.2 g per kg of bodyweight (0.7–1 g per lb), per the <a href="https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8" target="_blank" rel="noopener noreferrer">International Society of Sports Nutrition's position stand</a>. Go toward the top of the range in a deficit.</li>
        <li><strong>4. Give fat a floor, fill the rest with carbs.</strong> Around 0.5–0.8 g of fat per kg, then carbs take whatever calories remain.</li>
      </ul>
      <p>For the full math with worked examples, see our <a href="/blog/decoding-macros">guide to calculating your macro ratio</a>. If you'd rather skip the spreadsheet, <a href="https://macroplan.app">MacroPlan</a> calculates your targets from your stats and goal, then builds the meal plan to match.</p>

      <h2>How to Track Macros Without Losing Your Mind</h2>
      <p>Tracking accuracy fails in predictable places. These habits fix most of them:</p>
      <ul>
        <li><strong>Use a food scale for calorie-dense foods.</strong> Eyeballed peanut butter, oils, rice, and granola are where hidden hundreds of calories live. Weigh those; estimate the lettuce.</li>
        <li><strong>Pre-log your day in the morning.</strong> Deciding what you'll eat before you're hungry turns tracking from confession into planning.</li>
        <li><strong>Repeat meals on weekdays.</strong> A rotation of known meals means most of your day is pre-counted. Save the novelty for evenings and weekends.</li>
        <li><strong>Count cooking oil.</strong> A tablespoon is about 120 calories. Three untracked tablespoons a day can erase an entire deficit.</li>
        <li><strong>Aim for ranges, not bullseyes.</strong> Within ±5g protein and ±10g carbs and fat is a hit. Chasing exact zeros burns people out for no extra result.</li>
      </ul>

      <h2>Training Days vs. Rest Days</h2>
      <p>You don't burn the same energy on a heavy lower-body day as you do on the couch, and your macros can reflect that. The standard approach: keep protein constant every day, hold fat near its floor, and swing carbs up on training days and down on rest days while the weekly average stays on target. Our <a href="/blog/calorie-cycling-training-rest-days">calorie cycling guide</a> covers the setup in detail.</p>

      <h2>Where Meal Prep Fits</h2>
      <p>Flexible dieting tells you <em>what</em> to eat in numbers. It doesn't put the food in the fridge. The lifters who hold their macros for months almost all converge on the same logistics: batch-cook the structure of the week, proteins, carb bases, vegetables, and flex around it. A prepped container is a pre-counted meal; no negotiation at 8 p.m., no guess-tracking a takeaway. Our <a href="/blog/meal-prepping-for-weight-loss">meal prep guide</a> covers the Sunday workflow.</p>

      <h2>Common Flexible Dieting Mistakes</h2>
      <ul>
        <li><strong>Treating it as a junk-food diet.</strong> Technically you can hit macros on pop-tarts and whey. You'll also be hungry, under-fibered, and feel terrible in week two.</li>
        <li><strong>Ignoring fiber and micronutrients.</strong> A practical floor: around 14g of fiber per 1,000 calories, mostly from plants you'd recognize in a garden.</li>
        <li><strong>Changing targets weekly.</strong> Give any macro setup 2–3 weeks of consistent data before adjusting. Scale weight noise settles; trends don't lie.</li>
        <li><strong>All-or-nothing weekends.</strong> Five compliant weekdays don't survive a 5,000-calorie Saturday. Budget the weekend into the week instead of pretending it won't happen.</li>
      </ul>

      <h2>FAQ</h2>
      <h3>Is flexible dieting good for weight loss?</h3>
      <p>Yes, for weight loss, flexible dieting works as well as stricter approaches with the same calorie deficit, and most people sustain it longer because no foods are banned. The deficit drives the fat loss; flexibility drives the adherence. Individual results vary, and persistent issues with eating are worth raising with a professional.</p>
      <h3>Do I have to track forever?</h3>
      <p>No. Most people track strictly for a few months, learn what their portions actually look like, and then move to a looser structure, prepped meals on weekdays, estimation elsewhere, returning to strict tracking only when progress stalls.</p>
      <h3>What's the difference between IIFYM and counting calories?</h3>
      <p>Calorie counting tracks one number; IIFYM tracks three. The difference matters because 2,400 calories with 180g of protein produces a very different physique outcome than 2,400 calories with 60g of protein, especially while training.</p>
      <h3>Can I do flexible dieting as a vegetarian or vegan?</h3>
      <p>Yes. The targets don't change, the food list does. Plant-based lifters usually need more deliberate protein planning (tofu, tempeh, seitan, legumes, protein powder), but the macro framework is identical.</p>

      <p>Ready to stop guessing? <a href="https://macroplan.app/signup">Generate your first meal plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'June 2, 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxiYWxhbmNlZCUyMGhlYWx0aHklMjBtZWFsJTIwcGxhdGV8ZW58MXwwfHx8MTc4MjgwMTc1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Anna Pelzer on Unsplash",
    imageCreditUrl: "https://unsplash.com/@annapelzer?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'meal-prepping-for-weight-loss',
    title: 'The Ultimate Guide to Meal Prepping for Weight Loss',
    excerpt: 'Meal prep makes a calorie deficit something you eat, not something you fight. A step-by-step Sunday system for losing fat without weeknight willpower.',
    content: `
      <p>Meal prepping for weight loss works for an unglamorous reason: it moves every food decision to a moment when you're full, calm, and holding a plan, and away from the moments when you're hungry, tired, and standing in front of an open fridge. The deficit still does the fat loss. Prep is what makes the deficit survivable. Here's the complete system, from setting your numbers to keeping food good until Friday.</p>

      <h2>Why Meal Prep Works for Weight Loss</h2>
      <p>Most diets don't fail because the plan was wrong. They fail at around 8 p.m. on a Tuesday, when the day's willpower is spent and the fastest available food is the worst available food. Prepping removes that failure point three ways:</p>
      <ul>
        <li><strong>Pre-counted portions.</strong> A weighed container is a known quantity. No estimating, no "that was probably fine."</li>
        <li><strong>No decision fatigue.</strong> You made the food choice once, on Sunday. The weekday version of you just eats it.</li>
        <li><strong>Speed parity with junk.</strong> The prepped meal microwaves in two minutes, finally faster than delivery.</li>
      </ul>

      <h2>Step 1: Set Your Deficit and Protein</h2>
      <p>Before you cook anything, you need two numbers. First, a <strong>moderate calorie deficit</strong>, roughly 300–500 calories below maintenance. Bigger deficits read as faster progress but collapse adherence, energy, and training within weeks. Second, a <strong>high protein target</strong>: in a deficit, aim for 2–2.2 g per kg of bodyweight (about 1 g per lb) to protect muscle and stay full. Our <a href="/blog/decoding-macros">macro calculation guide</a> walks through the math, and <a href="https://macroplan.app">MacroPlan</a> will do it for you from your stats.</p>

      <h2>Step 2: The Sunday System</h2>
      <p>A full week of weight-loss food takes about two hours once you've done it twice. The workflow:</p>
      <ul>
        <li><strong>Plan (10 min).</strong> Pick 3–4 recipes that share ingredients. Decide which meals of the week they cover, most people start with lunches and dinners and keep breakfast simple.</li>
        <li><strong>Shop (30–40 min).</strong> One consolidated list, sorted by aisle. Shopping from a list after eating is the cheapest diet hack that exists.</li>
        <li><strong>Cook in parallel (60–90 min).</strong> Oven first (proteins and roasting vegetables), then rice cooker or pot (carb bases), then stovetop (mince, sauces). Longest cook time starts first.</li>
        <li><strong>Portion by weight (15 min).</strong> Weigh food into containers rather than eyeballing, this is where the deficit gets locked in.</li>
        <li><strong>Label and store.</strong> Days 1–3 in the fridge, days 4–5 toward the back (coldest part) or the freezer.</li>
      </ul>

      <h2>What to Cook: A Starter Template</h2>
      <p>Every weight-loss container follows the same anatomy. Pick one from each column and you can't really get it wrong:</p>
      <ul>
        <li><strong>Lean protein (150–200g cooked):</strong> chicken breast or thigh, turkey mince, white fish, lean beef, tofu</li>
        <li><strong>Measured carb (100–150g cooked):</strong> rice, potatoes, sweet potato, pasta, quinoa</li>
        <li><strong>High-volume vegetables (as much as fits):</strong> roasted broccoli, peppers, zucchini, green beans, cauliflower</li>
        <li><strong>Flavor that costs nothing:</strong> hot sauce, mustard, vinegar, salsa, herbs, spice rubs</li>
      </ul>
      <p>The protein and vegetables do the filling; the weighed carb controls the calories; the sauce keeps you from quitting out of boredom. For which specific foods survive five days in the fridge, see <a href="/blog/best-foods-for-batch-cooking">the best foods for batch cooking</a>.</p>

      <blockquote>Weigh the carbs and the oil. Those two habits alone account for most of the gap between "I'm eating clean but not losing" and actual fat loss.</blockquote>

      <h2>Step 3: Container Math</h2>
      <p>Count the meals you genuinely need covered, not an idealized 21. Most people's danger zone is weekday lunch and dinner: that's 10 containers. Breakfast can repeat daily from a 5-minute option, our <a href="/blog/high-protein-breakfasts">high-protein breakfast list</a> has prep-ahead choices, and weekends can stay flexible within your weekly calorie budget.</p>

      <h2>Mistakes That Quietly Stall Weight Loss</h2>
      <ul>
        <li><strong>Untracked cooking oil.</strong> At 120 calories per tablespoon, generous pours can hide 300+ daily calories. Measure it or use spray.</li>
        <li><strong>Prepped weekdays, untracked weekends.</strong> Two loose days can refill a five-day deficit. Budget weekends on purpose.</li>
        <li><strong>Liquid calories.</strong> Lattes, juice, and alcohol don't trigger fullness. They count anyway.</li>
        <li><strong>Going too aggressive.</strong> A deficit you can't hold isn't a deficit, it's a cycle. If hunger is unmanageable, our <a href="/blog/meal-prep-on-a-cut">guide to staying full on a cut</a> covers volume eating.</li>
        <li><strong>All-or-nothing thinking.</strong> One off-plan meal is a few hundred calories. The damage comes from the "week's ruined" spiral that follows it.</li>
      </ul>
      <p>One honest caveat: sustainable rates of fat loss are around 0.5–1% of bodyweight per week, and individual circumstances vary, persistent struggles with weight or eating are worth discussing with a professional.</p>

      <h2>FAQ</h2>
      <h3>How many days in advance can I meal prep?</h3>
      <p>Five days is the practical ceiling for refrigerated cooked food, and days 4–5 should be your most storage-friendly recipes or frozen portions. Most preppers cook Sunday for Monday–Friday and keep weekends flexible.</p>
      <h3>Does meal prep work without counting calories?</h3>
      <p>Better than almost any other approach. If the containers were portioned for a deficit when you cooked them, eating the containers <em>is</em> the calorie counting. That's the entire trick.</p>
      <h3>What if I get bored eating the same meals?</h3>
      <p>Cook proteins and carbs fairly plain, then vary the sauce and toppings day to day. Same chicken becomes a burrito bowl Monday and a curry Wednesday. Rotating 3–4 recipes per week beats cooking seven different ones.</p>
      <h3>Is meal prep expensive?</h3>
      <p>It's usually the cheapest way to eat for fat loss. Bulk proteins, rice, potatoes, and frozen or seasonal vegetables cost far less per meal than convenience food, and a consolidated list means you stop buying ingredients that rot unused.</p>

      <p>Want the plan, the portions, and the shopping list done for you? <a href="https://macroplan.app/signup">Generate your first meal plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'May 20, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxtZWFsJTIwcHJlcCUyMGNvbnRhaW5lcnMlMjBoZWFsdGh5JTIwZm9vZHxlbnwxfDB8fHwxNzgyODAxNzU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Ella Olsson on Unsplash",
    imageCreditUrl: "https://unsplash.com/@ellaolsson?utm_source=MacroPlan&utm_medium=referral",
    category: 'Meal Prep'
  },
  {
    slug: 'decoding-macros',
    title: 'Decoding Macros: How to Calculate Your Perfect Ratio',
    excerpt: 'Set protein first, give fat a floor, fill the rest with carbs. A step-by-step guide to calculating a macro split that fits your goal, with worked examples.',
    content: `
      <p>How to calculate your macros comes down to a four-step order of operations: find your calories, set protein, give fat a floor, and let carbs fill what's left. That ordering matters more than any "perfect ratio", percentages like 40/30/30 sound scientific but scale badly across bodyweights and goals. This guide walks the steps with real numbers.</p>

      <h2>What Each Macro Actually Does</h2>
      <h3>Protein, 4 cal/g</h3>
      <p>Protein supplies the raw material for muscle repair and growth, and it's the most satiating macro, which is why it anchors every cut. Most trained people do best on <strong>1.6–2.2 g per kg of bodyweight (0.7–1 g per lb)</strong> per day. Below that range you're leaving results on the table; far above it, the extra does little.</p>
      <h3>Carbohydrates, 4 cal/g</h3>
      <p>Carbs are your training fuel. They fill muscle glycogen, support hard sessions, and spare protein for its actual job. They're also the flex variable: the macro that swings up on training days and down on rest days while everything else holds steady.</p>
      <h3>Fat, 9 cal/g</h3>
      <p>Fat supports hormone production and absorbs fat-soluble vitamins. It needs a floor, chronically very low fat is where energy and hormone issues start, but past that floor, more fat mostly just costs calories that carbs could use. A sensible minimum is around <strong>0.5–0.8 g per kg</strong>.</p>

      <h2>Step 1: Find Your Calorie Target</h2>
      <p>Estimate maintenance with bodyweight in kg × 22, times an activity factor: about 1.3–1.4 if you're mostly sedentary outside training, 1.5–1.6 training 3–5x/week, up to 1.7+ for very active jobs. Then adjust for the goal: subtract 300–500 calories to cut, add 150–300 to lean bulk, keep it for maintenance.</p>
      <p>An 80 kg (176 lb) lifter training four days a week lands near 2,700 maintenance calories, call it 2,300 on a cut or 2,900 on a lean bulk.</p>

      <h2>Step 2–4: Protein, Then Fat, Then Carbs</h2>
      <p>Using that 80 kg lifter on a 2,300-calorie cut:</p>
      <ul>
        <li><strong>Protein:</strong> 2.2 g/kg on a cut → 176g → 704 calories</li>
        <li><strong>Fat:</strong> 0.7 g/kg floor → 56g → 504 calories</li>
        <li><strong>Carbs:</strong> the remaining 1,092 calories → 273g</li>
      </ul>
      <p>Same lifter, lean bulk at 2,900: protein eases to 1.8 g/kg (144g), fat to 0.9 g/kg (72g), and carbs climb to about 419g, the surplus goes to training fuel, exactly where you want it.</p>

      <blockquote>Protein is set by your bodyweight, fat by a floor, carbs by whatever calories remain. Ratios fall out of the process, you never pick them directly.</blockquote>

      <h2>Adjust From Data, Not Vibes</h2>
      <p>Whatever you calculate is a starting estimate, not a verdict. Run the numbers for two to three weeks, weigh yourself a few mornings a week, and compare the weekly averages:</p>
      <ul>
        <li><strong>Cutting</strong> and losing roughly 0.5–1% of bodyweight per week? Hold. Losing nothing? Drop 150–200 calories, from carbs or fat.</li>
        <li><strong>Bulking</strong> and gaining about 0.25–0.5% per week? Hold. Gaining much faster? You're mostly gaining fat, trim the surplus.</li>
        <li><strong>Maintaining</strong> within a kilo? You've found maintenance. That number is gold; remember it.</li>
      </ul>
      <p>Daily scale weight is noise, water, sodium, and glycogen swing it by a kilo or more. Only trends over weeks mean anything.</p>

      <h2>Training Days vs. Rest Days</h2>
      <p>One refinement worth making once the basics work: eat more carbs on training days and fewer on rest days, keeping protein constant. Your weekly calories stay identical, but the fuel lands where it's used. The setup is covered in our <a href="/blog/calorie-cycling-training-rest-days">calorie cycling guide</a>, and it pairs naturally with <a href="/blog/meal-prepping-for-weight-loss">batch-prepped meals</a>, cook both day-types on Sunday and grab the right container.</p>

      <h2>FAQ</h2>
      <h3>What is the best macro ratio for fat loss?</h3>
      <p>There isn't a universal one. Fat loss comes from the calorie deficit; the best "ratio" is high protein (2–2.2 g/kg), a fat floor (0.5–0.8 g/kg), and the rest in carbs. For most lifters that works out near 35/35/30 protein/carb/fat, but it's a result, not a rule.</p>
      <h3>Should I count net carbs or total carbs?</h3>
      <p>Total carbs, unless you're running keto. Fiber's metabolic contribution is small and tracking total keeps your numbers consistent with most food labels and databases.</p>
      <h3>Do macros matter if I hit my calories?</h3>
      <p>For weight on the scale, calories decide. For what that weight is made of, muscle kept or lost, training quality, hunger, the split matters a lot, and protein matters most. Two diets with equal calories and different protein produce visibly different physiques.</p>
      <h3>How often should I recalculate my macros?</h3>
      <p>Whenever bodyweight changes by roughly 3–5 kg, your training volume changes meaningfully, or progress stalls for three or more weeks. Otherwise leave the targets alone and let consistency work.</p>

      <p>If you'd rather skip the math entirely, MacroPlan calculates your targets and builds the week of food to hit them. <a href="https://macroplan.app/signup">Get your numbers free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'May 12, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbnV0cml0aW9uJTIwZm9vZCUyMHZhcmlldHl8ZW58MXwwfHx8MTc4MjgwMTc1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Dan Gold on Unsplash",
    imageCreditUrl: "https://unsplash.com/@danielcgold?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'high-protein-breakfasts',
    title: '10 High-Protein Breakfasts to Fuel Your Day (30g+ Each)',
    excerpt: 'Ten breakfasts with 30g+ protein each, most prepped ahead in minutes. Macros included, so hitting your protein target starts before you leave the house.',
    content: `
      <p>High-protein breakfasts are the easiest lever in your whole diet. Front-load 30–50g of protein before you leave the house and the rest of the day's target stops being a chase. Skip it, and you're staring at 140g still to eat at 6 p.m. Here are ten options that deliver at least 30g each, approximate macros included, and most can be prepped the night before.</p>

      <h2>1. Greek Yogurt Power Bowl</h2>
      <p>Mix 250g of 2% Greek yogurt with half a scoop of whey, top with berries and 30g of granola. <strong>~420 cal, 42g protein.</strong> Ninety seconds of effort, no cooking, endlessly variable.</p>

      <h2>2. Cottage Cheese Scramble</h2>
      <p>Stir 100g of cottage cheese into three eggs as they scramble. The curds melt into a creamy, diner-style plate. <strong>~330 cal, 32g protein.</strong> Add toast for another 15g of carbs that actually keep you full.</p>

      <h2>3. Protein Pancakes</h2>
      <p>Blend 50g oats, 150g egg whites, 100g cottage cheese, and a banana; cook like normal pancakes. <strong>~450 cal, 35g protein.</strong> Make a double batch on prep day, they reheat from the fridge all week.</p>

      <h2>4. Overnight Protein Oats</h2>
      <p>50g oats, a scoop of whey, 150ml milk, and a spoon of chia in a jar; shake and refrigerate overnight. <strong>~440 cal, 38g protein.</strong> The definitive grab-and-go option, make five jars on Sunday.</p>

      <h2>5. Smoked Salmon Bagel</h2>
      <p>A toasted bagel with light cream cheese and 100g of smoked salmon. <strong>~430 cal, 33g protein.</strong> The savory option that feels like a weekend even on a Tuesday.</p>

      <h2>6. Baked Egg Muffins</h2>
      <p>Whisk a dozen eggs with diced peppers, spinach, and ham; bake in a muffin tin at 180°C (350°F) for 20 minutes. Three muffins: <strong>~310 cal, 28g protein</strong>, add a yogurt to clear 35g. They keep four days refrigerated and microwave in 30 seconds.</p>

      <h2>7. Breakfast Burritos (Freezer-Friendly)</h2>
      <p>Scrambled eggs, turkey sausage, black beans, and cheese in a large tortilla. Wrap individually in foil and freeze. <strong>~480 cal, 36g protein.</strong> Two minutes from freezer to breakfast, the meal-preppers' classic for a reason.</p>

      <h2>8. Tofu Scramble (Plant-Based)</h2>
      <p>Crumble 200g of firm tofu into a hot pan with turmeric, garlic powder, and nutritional yeast. <strong>~280 cal, 26g protein</strong>, add a slice of toast with peanut butter to pass 30g. The strongest vegan option that doesn't lean on powder.</p>

      <h2>9. Post-Workout Breakfast Smoothie</h2>
      <p>Whey, 60g oats, a banana, a spoon of peanut butter, and milk. <strong>~560 cal, 42g protein.</strong> Drinks in two minutes, which makes it the answer for people who "can't eat in the morning."</p>

      <h2>10. Skyr Parfait</h2>
      <p>Layer 250g of skyr with granola and honey. Skyr runs even higher in protein than Greek yogurt per calorie. <strong>~390 cal, 45g protein.</strong></p>

      <h2>How Much Protein Should Breakfast Have?</h2>
      <p>Aim for roughly 0.4 g per kg of bodyweight at each meal, for most lifters that's 30–50g at breakfast. Spreading protein across 3–5 meals keeps muscle protein synthesis elevated through the day rather than relying on a giant dinner; our guide on <a href="/blog/how-much-protein-to-build-muscle">how much protein you actually need</a> covers the daily totals.</p>

      <blockquote>The lifters who hit their protein target consistently aren't more disciplined at dinner. They're 40g ahead by 9 a.m.</blockquote>

      <h2>FAQ</h2>
      <h3>What breakfast has the most protein?</h3>
      <p>Per minute of effort, a skyr or Greek yogurt bowl with added whey wins: 40–45g of protein in under two minutes with no cooking. Per sit-down meal, an egg-and-meat scramble with dairy added can clear 50g.</p>
      <h3>Can I meal prep high-protein breakfasts?</h3>
      <p>Yes, six of the ten above prep ahead. Egg muffins and frozen burritos cover hot breakfasts for a week, and overnight oats jars cover cold ones. Prepping breakfast is usually the highest-value 20 minutes of a <a href="/blog/meal-prepping-for-weight-loss">Sunday prep session</a>.</p>
      <h3>Is skipping breakfast bad for muscle gain?</h3>
      <p>Not inherently, total daily protein and calories still rule. But practically, skipping breakfast crams your full protein target into fewer meals, which is harder to eat and slightly less favorable for muscle protein synthesis. If you skip it, plan the other meals deliberately.</p>

      <p>Breakfast is one meal, MacroPlan plans the other twenty. <a href="https://macroplan.app/signup">Build your full week free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'May 27, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1513442542250-854d436a73f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxoaWdoJTIwcHJvdGVpbiUyMGJyZWFrZmFzdCUyMGVnZ3N8ZW58MXwwfHx8MTc4MjgwMTc1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Chris Ralston on Unsplash",
    imageCreditUrl: "https://unsplash.com/@thisisralston?utm_source=MacroPlan&utm_medium=referral",
    category: 'Recipes'
  },
  {
    slug: 'high-protein-meal-prep-muscle',
    title: 'High-Protein Meal Prep for Muscle Gain: A Lifter’s Playbook',
    excerpt: 'Building muscle is a logistics problem as much as a training one. Here’s how to prep a week of high-protein food that actually supports growth, without living in your kitchen.',
    content: `
      <p>You can train perfectly and still not grow. If the protein and calories aren't there, week after week, the stimulus has nothing to build with. For most lifters, the limiting factor isn't the program, it's getting enough quality food in consistently. That's a logistics problem, and meal prep is how you solve it.</p>

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
      <p>On a muscle-gain phase you're eating in a slight surplus, and carbohydrates are where most of those extra calories should go. They fuel hard training and spare protein for its actual job, repair. Batch-cook carbs that reheat well: rice, potatoes, pasta, and oats. Weigh them cooked into your containers so the surplus is deliberate, not accidental.</p>

      <blockquote>A "lean bulk" fails in one of two directions: too small a surplus and you don't grow, too large and you just get fat. Prepping your carbs by weight is how you keep the surplus honest.</blockquote>

      <h2>Make the Calories Easy to Hit</h2>
      <p>The hardest part of gaining is the back half of a big eating day when you're full. Build in calorie-dense, easy-to-eat options so you're not force-feeding chicken at 9 p.m.:</p>
      <ul>
        <li>A blended shake with whey, oats, peanut butter, and banana (600+ calories, drinks in two minutes)</li>
        <li>Trail mix or nuts portioned into the week's snack slots</li>
        <li>Whole milk or a mass-gainer-style smoothie if you're a hard gainer</li>
      </ul>

      <h2>The Sunday Session</h2>
      <p>Block two hours. Start the oven proteins first, get rice and potatoes going while they cook, portion everything into containers labeled with macros, and you're done for five days. If you've never run a structured prep day, our <a href="/blog/meal-prepping-for-weight-loss">meal prep playbook</a> walks through the basics, the same workflow applies whether you're cutting or gaining.</p>

      <p>MacroPlan generates a full muscle-gain prep around your protein and calorie targets, including the shopping list and a cooking order for prep day. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'January 14, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1562036409-9dcc48472e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwcmljZSUyMG1lYWwlMjBwcmVwJTIwY29udGFpbmVyfGVufDF8MHx8fDE3ODI4MDE3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Jonathan Borba on Unsplash",
    imageCreditUrl: "https://unsplash.com/@jonathanborba?utm_source=MacroPlan&utm_medium=referral",
    category: 'Meal Prep'
  },
  {
    slug: 'how-much-protein-to-build-muscle',
    title: 'How Much Protein Do You Actually Need to Build Muscle?',
    excerpt: 'The internet says everything from 0.8 g to 4 g per kilo. Here’s what the research actually supports, and how to set a number you can hit every day.',
    content: `
      <p>Ask ten lifters how much protein you need and you'll get ten answers. Some are anchored to outdated RDA figures meant for sedentary people; others are repeating supplement-industry numbers designed to sell more powder. The actual evidence is narrower and more boring than either camp.</p>

      <h2>The Number the Research Supports</h2>
      <p>Across meta-analyses of resistance-trained people, the benefit of additional protein for muscle growth plateaus around <strong>1.6 g per kilogram of bodyweight per day</strong>, with a sensible upper bound near <strong>2.2 g per kg</strong> for most lifters. In pounds, that's roughly 0.7–1 g per pound of bodyweight.</p>

      <p>For an 80 kg (176 lb) lifter, that's about 130–175 g of protein per day. Eating well above that range won't hurt a healthy person, but it also won't build extra muscle, it just displaces other food or calories.</p>

      <blockquote>More protein is not more muscle past a point. Once you're in the 1.6–2.2 g/kg range, training and consistency drive the result, not the next scoop.</blockquote>

      <h2>When to Aim Higher in the Range</h2>
      <p>Push toward 2.2 g/kg if you're:</p>
      <ul>
        <li><strong>In a calorie deficit</strong> (cutting), higher protein protects muscle when calories are low and improves fullness</li>
        <li><strong>Older</strong>, anabolic resistance means seniors benefit from slightly more protein per meal</li>
        <li><strong>Very lean and advanced</strong>, the closer you are to your genetic ceiling, the more the details matter</li>
      </ul>

      <h2>Distribution Beats Heroics</h2>
      <p>Total daily protein is what matters most, but how you spread it helps. Aim for 3–5 meals each delivering around 0.4 g per kg, roughly 25–40 g per meal for most people. That keeps muscle protein synthesis topped up through the day rather than relying on one giant dinner.</p>

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
    image: 'https://images.unsplash.com/photo-1670398564097-0762e1b30b3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGJyZWFzdCUyMHByb3RlaW58ZW58MXwwfHx8MTc4MjgwMTc2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Elena Leya on Unsplash",
    imageCreditUrl: "https://unsplash.com/@foodistika?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'meal-prep-on-a-cut',
    title: 'Meal Prep on a Cut: How to Stay Full While Losing Fat',
    excerpt: 'The deficit is the hard part, not the math, the hunger. Here’s how to prep meals that keep you full on fewer calories so the cut actually sticks.',
    content: `
      <p>Cutting is simple on paper: eat fewer calories than you burn, keep protein high, keep training hard. The reason most cuts fail has nothing to do with the math. It's hunger, decision fatigue, and a fridge full of nothing you want to eat at 8 p.m. Meal prep is how you engineer those failure points out of the week.</p>

      <h2>Protein and Volume Are Your Two Levers</h2>
      <p>In a deficit, two things keep you full: high protein and high food volume. Protein is the most satiating macro and protects muscle while you lose fat, so keep it at the top of your range, around 2–2.2 g per kg of bodyweight. Volume means choosing foods that take up space in your stomach for few calories.</p>

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

      <p>This is the same principle behind any good <a href="/blog/meal-prepping-for-weight-loss">weight-loss meal prep</a>, but on a cut the stakes are higher because the deficit leaves less room for improvised eating.</p>

      <h2>Plan Your Refeeds and Treats</h2>
      <p>A cut you can't sustain isn't a good cut. Build a planned higher-carb day or a budgeted treat into the week on purpose. Flexible dieting works precisely because it bends without breaking, if you've never run macros this way, our <a href="/blog/ultimate-guide-to-flexible-dieting">flexible dieting guide</a> covers the mindset. The goal is a deficit you can hold for 8–16 weeks, not a perfect three days followed by a blowout.</p>

      <h2>Don't Slash Calories Too Hard</h2>
      <p>An aggressive deficit feels productive for a week and then wrecks your energy, training, and adherence. A moderate deficit, roughly 300–500 calories below maintenance, loses fat at a sustainable rate while leaving enough food to stay sane and strong. Prep makes that moderate deficit feel like more food than it is, because none of it is wasted on meals you don't want.</p>

      <p>MacroPlan builds a high-protein, high-volume cut around a sensible deficit, with the shopping list and prep order included. <a href="https://macroplan.app/signup">Start your cut plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'March 9, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsJTIwbGVhbnxlbnwxfDB8fHwxNzgyODAxNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Anna Pelzer on Unsplash",
    imageCreditUrl: "https://unsplash.com/@annapelzer?utm_source=MacroPlan&utm_medium=referral",
    category: 'Meal Prep'
  },
  {
    slug: 'calorie-cycling-training-rest-days',
    title: 'Calorie Cycling: Why Your Training and Rest Days Shouldn’t Match',
    excerpt: 'You don’t burn the same energy on leg day as you do on the couch, so why eat the same? A practical look at training-day and rest-day calorie cycling.',
    content: `
      <p>Most people eat the same number of calories every day, all week. It's simpler, and for plenty of goals it's perfectly fine. But if you train hard some days and rest others, your body's energy demand swings a lot from day to day, and matching your intake to that swing can make a cut or a lean bulk more comfortable and more effective. That's calorie cycling.</p>

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
      <p>Calorie cycling is more planning. You now have two daily templates instead of one, and rest days come with their own problem, appetite tends to drop right when you're trying to keep protein up, so pre-portioned rest-day meals matter even more than usual.</p>

      <p>This is exactly where batch prep earns its keep. If your training-day and rest-day containers are both cooked and labeled on Sunday, the cycling happens automatically, you just grab the right container for the day. MacroPlan calculates separate training-day and rest-day targets from your schedule and preps around both. <a href="https://macroplan.app/signup">Try it free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'April 6, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1644704170910-a0cdf183649b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwaGVhbHRoeSUyMGZvb2R8ZW58MXwwfHx8MTc4MjgwMTc2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Clark Douglas on Unsplash",
    imageCreditUrl: "https://unsplash.com/@clark_douglas?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  },
  {
    slug: 'best-foods-for-batch-cooking',
    title: 'The Best Foods for Batch Cooking (That Still Taste Good on Day 4)',
    excerpt: 'Some foods are built for the fridge. Others turn sad and rubbery by Wednesday. Here’s what to batch-cook so day-four lunch is still something you want to eat.',
    content: `
      <p>The dirty secret of meal prep is that a lot of food simply doesn't survive five days in a container. You cook a beautiful Sunday spread, and by Wednesday the chicken is dry, the broccoli is grey, and you're ordering takeout. The fix isn't more willpower, it's choosing foods that are actually built to be cooked in bulk and reheated.</p>

      <h2>Proteins That Reheat Well</h2>
      <ul>
        <li><strong>Chicken thighs:</strong> more forgiving than breast, the extra fat keeps them juicy after reheating. The single best default protein for prep.</li>
        <li><strong>Beef and turkey mince:</strong> cooked in a sauce, they reheat beautifully and absorb flavor over a few days.</li>
        <li><strong>Whole eggs and egg bites:</strong> baked egg muffins hold for days and microwave in 30 seconds.</li>
        <li><strong>Salmon:</strong> stays moist thanks to its fat content; best eaten in the first 2–3 days.</li>
        <li><strong>Pulled/slow-cooked meats:</strong> built for this, they get better as they sit.</li>
      </ul>
      <p>The protein most likely to disappoint is plain chicken breast cooked dry. If you love it, slightly undercook it, store it in its juices or a sauce, and reheat gently.</p>

      <h2>Carbs That Hold Up</h2>
      <ul>
        <li><strong>Rice:</strong> the workhorse, reheats perfectly with a splash of water (cool and refrigerate it promptly after cooking).</li>
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
        <li>Hardy raw veg eaten cold, cherry tomatoes, cucumber, peppers</li>
      </ul>
      <p>Leafy greens like spinach are best added fresh at eating time rather than cooked and stored.</p>

      <blockquote>Roast your vegetables, slightly undercook your starches, and keep proteins in their juices. Those three habits are the difference between a prep you finish and one you abandon by Wednesday.</blockquote>

      <h2>Cook Once, Flavor Differently</h2>
      <p>Boredom kills meal prep faster than texture. Cook your proteins and carbs fairly plain, then change the flavor at the plate, a different sauce, spice blend, or fresh topping each day. Same batch of chicken and rice becomes a burrito bowl, a stir-fry, and a curry across the week without you cooking three times.</p>

      <h2>The Prep-Day Order</h2>
      <p>Work longest-to-shortest: get oven proteins and roasting vegetables going first, start rice and potatoes while they cook, then portion everything into containers labeled with macros. Two hours on Sunday buys you five days of food you'll actually eat. For the full workflow, see our <a href="/blog/meal-prepping-for-weight-loss">meal prep guide</a>.</p>

      <p>MacroPlan picks batch-friendly recipes that hit your macros and gives you the prep-day cooking order automatically. <a href="https://macroplan.app/signup">Generate your first prep free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'May 4, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxiYXRjaCUyMGNvb2tpbmclMjBtZWFsJTIwcHJlcCUyMGZvb2R8ZW58MXwwfHx8MTc4MjgwMTc2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Ella Olsson on Unsplash",
    imageCreditUrl: "https://unsplash.com/@ellaolsson?utm_source=MacroPlan&utm_medium=referral",
    category: 'Meal Prep'
  },
  {
    slug: 'best-protein-for-meal-prep',
    title: 'Chicken vs. Beef vs. Salmon: Best Protein for Meal Prep',
    excerpt: 'Chicken, beef, or salmon? We compare macros, cost, fridge life, and reheat quality to find the best protein for meal prep, and when to use each one.',
    content: `
      <p>The best protein for meal prep isn't decided by macros alone. A protein that's perfect on paper but dry by Wednesday, or blows the food budget, isn't the one you'll still be prepping in March. Here's how chicken, beef, and salmon actually compare across the four things that matter: macros, cost, fridge life, and how they survive a microwave.</p>

      <h2>The Comparison at a Glance</h2>
      <p>Per 100g raw, approximately:</p>
      <ul>
        <li><strong>Chicken breast:</strong> 165 cal, 31g protein, 3.6g fat, highest protein per calorie, lowest cost per gram of protein</li>
        <li><strong>Chicken thigh:</strong> 177 cal, 24g protein, 8.4g fat, slightly fewer protein points, far more forgiving in storage</li>
        <li><strong>Lean beef mince (93/7):</strong> 152 cal, 21g protein, 7g fat, mid-priced, excellent reheater in sauces, brings iron and B12</li>
        <li><strong>Salmon:</strong> 208 cal, 20g protein, 13g fat, the expensive one, but the only one carrying meaningful omega-3s</li>
      </ul>

      <h2>Chicken: The Volume Pick</h2>
      <p><strong>Breast</strong> wins every spreadsheet: most protein per calorie and per dollar. Its weakness is storage, cooked dry, it's rubbery by day three. If you prep breast, slightly undercook it, store it in its juices or a sauce, and reheat gently. <strong>Thighs</strong> trade a little protein for fat that acts as insurance: they come out of a microwave on day four still tasting like food. For most preppers, thighs are the better default and breast is the cut-season specialist.</p>

      <h2>Beef: The Flavor Workhorse</h2>
      <p>Lean mince cooked into chili, bolognese, or taco meat is arguably the single best-storing protein there is, sauce-based dishes improve over a few days as flavors develop. Beef also brings heme iron, zinc, and B12, which matter if your diet skews chicken-only. Watch the fat percentage: 93/7 keeps calories close to thigh territory, while 80/20 nearly doubles the fat. On a strict cut, drain the pan.</p>

      <h2>Salmon: The Health Pick With a Deadline</h2>
      <p>Salmon is the only one of the three with substantial <a href="https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/" target="_blank" rel="noopener noreferrer">omega-3 fatty acids</a>, and its fat keeps it moist through reheating. Two caveats: it's typically 2–3× the price of chicken per portion, and cooked fish is best eaten within 2–3 days, schedule salmon containers early in the week. Reheat gently or eat it cold over a grain salad to spare your office microwave's reputation.</p>

      <blockquote>Run all three in one prep: thighs as the base, a beef sauce dish for mid-week, salmon for days one and two. Variety is what keeps a prep streak alive.</blockquote>

      <h2>The Verdict by Goal</h2>
      <ul>
        <li><strong>Cutting:</strong> chicken breast and 93/7 beef, maximum protein and fullness per calorie</li>
        <li><strong>Lean bulking:</strong> thighs and salmon, the extra fat is calorie headroom you need anyway</li>
        <li><strong>Tightest budget:</strong> whole chicken or thighs, plus eggs and <a href="/blog/best-foods-for-batch-cooking">legumes from the batch-cooking list</a></li>
        <li><strong>Maximum prep-life:</strong> beef in sauce, then thighs, then breast-in-sauce, with salmon eaten first</li>
      </ul>

      <h2>FAQ</h2>
      <h3>What protein lasts longest in meal prep?</h3>
      <p>Mince cooked into a sauce, chili, bolognese, curry, comfortably holds five days refrigerated and arguably tastes better on day three. Plain grilled chicken breast has the shortest enjoyable window; fish should be eaten within 2–3 days.</p>
      <h3>Is salmon worth the price for meal prep?</h3>
      <p>For one or two meals a week, yes: it's the easiest whole-food source of omega-3s and reheats better than lean white fish. As your only protein it's expensive and ages fastest, use it as the rotation's highlight, not the base.</p>
      <h3>Can I mix proteins in one prep session?</h3>
      <p>You should. A tray of thighs in the oven, mince in a pan, and salmon for early-week containers all cook in parallel in under 90 minutes, and the variety stops the Wednesday boredom that kills prep habits. Our <a href="/blog/high-protein-meal-prep-muscle">muscle-gain prep playbook</a> shows a full rotation.</p>

      <p>MacroPlan rotates proteins across your week automatically and portions them to your macros. <a href="https://macroplan.app/meal-plans/generate">Start your first prep, free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'June 8, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1499125562588-29fb8a56b5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxzYWxtb24lMjBjaGlja2VuJTIwcHJvdGVpbiUyMGNvb2tpbmd8ZW58MXwwfHx8MTc4MjgwMTc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Caroline Attwood on Unsplash",
    imageCreditUrl: "https://unsplash.com/@_carolineattwood?utm_source=MacroPlan&utm_medium=referral",
    category: 'Meal Prep'
  },
  {
    slug: 'stop-tracking-macros-burnout',
    title: 'Macro Tracking Burnout: How to Keep Results Without Logging',
    excerpt: 'Macro tracking works until logging every gram burns you out. Here’s how to keep your results with structure instead of a food diary, containers do the counting.',
    content: `
      <p>Macro tracking burnout is real, predictable, and almost never discussed by the apps that depend on you logging forever. After months of weighing rice and scanning barcodes, the act of tracking itself becomes the diet's biggest cost, and when it collapses, it tends to take the whole routine down with it. You don't have to choose between logging every gram and flying blind. There's a middle path: structure.</p>

      <h2>Why Tracking Burns People Out</h2>
      <p>Logging is a tax on every single eating decision. Twenty-plus times a day you stop, weigh, search a database, and judge the result. That's manageable when motivation is high and results are fast. It corrodes when life gets busy, progress slows to maintenance pace, or eating out turns every meal into estimation homework. The failure mode is familiar: a missed day becomes a missed week, and without the tracker you realize you never actually learned what to eat, only how to record it.</p>

      <h2>The Insight: Structure Replaces Surveillance</h2>
      <p>Tracking solves one problem: knowing your numbers. But there's another way to know them, <strong>decide them in advance</strong>. If Sunday-you cooks ten containers portioned to your targets, then weekday-you eating a container <em>is</em> hitting your macros. Nothing to log, because nothing is unknown. The counting happened once, at the cutting board, instead of twenty times a day at the table.</p>

      <blockquote>A tracked diet measures what you ate. A structured diet decides what you'll eat. The second one is less work every single day.</blockquote>

      <h2>The Step-Down Protocol</h2>
      <p>Don't quit tracking cold. Step down through three phases:</p>
      <ul>
        <li><strong>Phase 1, Track + prep (2–3 weeks).</strong> Keep logging, but batch-prep your weekday meals. You'll notice your log becomes copy-paste; that's the system proving itself. If prep is new to you, start with the <a href="/blog/meal-prepping-for-weight-loss">Sunday system</a>.</li>
        <li><strong>Phase 2, Prep + spot-check (a month or more).</strong> Stop logging prepped meals; they're pre-counted. Only track the unstructured edges, weekends, restaurants. Most people are now logging two or three entries a day instead of twenty.</li>
        <li><strong>Phase 3, Structure + bodyweight trend.</strong> Stop logging entirely. Your feedback loop becomes a few morning weigh-ins a week and how training feels. Trend moving the wrong way for two or three weeks? Tighten the structure or briefly re-track to recalibrate.</li>
      </ul>

      <h2>What You Keep Doing</h2>
      <p>Structure isn't zero awareness. Three habits carry the result:</p>
      <ul>
        <li><strong>Protein anchors at every meal.</strong> You learned what 40g looks like during your tracking months, keep serving it. A <a href="/blog/high-protein-breakfasts">high-protein breakfast</a> makes the day's total nearly automatic.</li>
        <li><strong>Weigh-ins as the dashboard.</strong> The scale's weekly average replaces the food log as your data source.</li>
        <li><strong>Honest edges.</strong> The structure covers ~80% of meals. The other 20% stays sane because it's a known, budgeted share, not a blind spot.</li>
      </ul>

      <h2>When to Go Back to Tracking</h2>
      <p>Re-tracking isn't failure; it's a tool you pull out for precision phases. Worth it when you're starting an aggressive cut, pushing a contest prep, or genuinely stalled and unsure why. Two weeks of honest logging usually finds the leak, then you fold the fix into the structure and put the scale app away again. And if tracking has ever tipped into something that feels compulsive rather than useful, that's a conversation for a professional, not a protocol.</p>

      <h2>Where MacroPlan Fits</h2>
      <p>This is exactly the gap MacroPlan was built for: it's not a tracker, it's the structure. Tell it your targets, your prep day, and your container count, and it generates the batch-cook plan, the portions, and the shopping list, the pre-counted week that makes logging unnecessary. <a href="https://macroplan.app/signup">Generate your first plan free →</a></p>
    `,
    author: TEAM_AUTHOR,
    authorBio: TEAM_BIO,
    authorImage: TEAM_IMAGE,
    date: 'June 10, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjU2MDR8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZWF0aW5nJTIwbGlmZXN0eWxlJTIwcmVsYXhlZHxlbnwxfDB8fHwxNzgyODAxNzY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageCredit: "Photo by Brooke Lark on Unsplash",
    imageCreditUrl: "https://unsplash.com/@brookelark?utm_source=MacroPlan&utm_medium=referral",
    category: 'Nutrition'
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
