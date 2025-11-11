# Macro Calculator Research Findings & Recommendations

## Honesty About Original Implementation

**Initial approach**: I based the macro adjustments on general sports nutrition principles from my training data (cutoff January 2025) **without doing additional research**. This was inadequate for something as critical as macro calculations that affect user health and fitness outcomes.

**Corrective action**: Conducted research using current evidence-based sources (2024-2025).

---

## Research Sources

### Primary Source: International Society of Sports Nutrition (ISSN)
- **Position Stand**: "Protein and Exercise" (2017, still current standard)
- **URL**: https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8
- **Status**: Gold standard for evidence-based protein recommendations

### Additional Sources
- **PubMed Central**: Recent 2024-2025 studies on protein requirements for athletes
- **Evidence Quality**: Meta-analyses and systematic reviews

---

## Key Findings

### 1. Protein Requirements (Evidence-Based)

#### Daily Intake Ranges
| Population | Protein Intake | Source |
|------------|----------------|---------|
| General active individuals | 1.4-2.0 g/kg/day | ISSN |
| Strength/power athletes | 1.6-2.0 g/kg/day | ISSN |
| Zero nitrogen balance (strength) | 1.41 g/kg/day | Nitrogen balance studies |
| Recommended intake (strength) | 1.76 g/kg/day | Nitrogen balance studies |
| High intake for fat loss | >3.0 g/kg/day | Recent research |

**Conversion to imperial**:
- 1.6 g/kg = **0.73 g/lb**
- 2.0 g/kg = **0.91 g/lb**
- 3.0 g/kg = **1.36 g/lb** (cutting with aggressive fat loss)

#### Per-Meal Distribution
- **0.25 g per kg body weight** per meal (or 20-40g absolute)
- **700-3000 mg leucine** per serving
- **Every 3-4 hours** throughout the day for optimal muscle protein synthesis

#### Context-Specific Recommendations

**During Caloric Surplus (Bulking)**:
- Baseline: 1.6-2.0 g/kg/day
- Protein supplementation supports greater lean mass gains
- Lower end acceptable if total calories are adequate

**During Caloric Deficit (Cutting)**:
- **2-3× the RDA** (RDA = 0.8 g/kg, so 1.6-2.4 g/kg minimum)
- Up to **3.0+ g/kg** for aggressive fat loss while preserving muscle
- Higher protein crucial for muscle preservation

---

## What Our Current Implementation Does

### ✅ What We Do Right

1. **Use Mifflin-St Jeor for BMR** (lib/calculations/bmr.ts:52-58)
   - More accurate than Harris-Benedict for modern populations
   - Uses weight, height, age, sex (NOT BMI) ✓
   - Appropriate for athletes with higher muscle mass ✓

2. **TDEE Calculation** (lib/calculations/tdee.ts)
   - Multiplies BMR by activity level
   - Standard approach used in research

3. **No BMI Usage** ✓
   - BMI penalizes muscle mass (not used anywhere)
   - We use absolute weight + height instead

### ❌ What Needs Fixing

#### Issue 1: Protein Ranges Are Off

**Current Implementation** (lib/calculations/macros.ts:46-102):
```typescript
// Bulk
case 'beginner': baseProtein = weightLbs * 0.8  // 1.76 g/kg ✓
case 'intermediate': baseProtein = weightLbs * 0.9  // 1.98 g/kg (TOO HIGH)
case 'advanced': baseProtein = weightLbs * 1.0  // 2.20 g/kg (TOO HIGH)

// Cut
case 'beginner': baseProtein = weightLbs * 1.0  // 2.20 g/kg ✓
case 'intermediate': baseProtein = weightLbs * 1.1  // 2.42 g/kg (TOO HIGH)
case 'advanced': baseProtein = weightLbs * 1.2  // 2.64 g/kg (TOO HIGH)
```

**Evidence-Based Ranges**:
- Bulk: 1.6-2.0 g/kg (0.73-0.91 g/lb)
- Cut: 2.0-3.0 g/kg (0.91-1.36 g/lb)
- Experience level does NOT significantly affect protein needs per research

#### Issue 2: Experience Level Assumption

**Current**: Protein scales with experience (beginner → advanced = more protein)

**Research Finding**: "The evidence base predominantly studied untrained to moderately trained individuals; **specific recommendations for advanced athletes remain less defined** in the literature."

**Reality**: Protein needs are more dependent on:
1. **Caloric state** (deficit vs surplus)
2. **Training volume** (more volume = slightly higher protein)
3. **Body composition goals** (aggressive fat loss = higher protein)

Experience level is **NOT a primary factor** in protein requirements.

#### Issue 3: Fat Distribution Logic

**Current** (lib/calculations/macros.ts:112-136):
- Cut: 30% of calories
- Bulk (moderate): 25% of calories
- Bulk (very active): 20% of calories

**Assessment**: This is reasonable but lacks research backing. Fat needs are typically:
- **Minimum**: 0.5-1.0 g/kg for hormone production
- **Typical range**: 20-35% of total calories
- **Athlete preference**: Often lower fat (20-25%) to maximize carbs for training

**Verdict**: Current approach is acceptable, but should validate minimum fat intake (0.5-1.0 g/kg).

---

## Recommended Changes

### Change 1: Fix Protein Calculation Logic

**Remove experience-based protein scaling**. Use evidence-based ranges:

```typescript
function calculateProteinNeeds(
  weightKg: number,
  goal: Goal,
  activityLevel: ActivityLevel
): number {
  let proteinGKg: number

  // Research-backed ranges
  if (goal === 'cut') {
    // Cutting: 2.0-3.0 g/kg to preserve muscle
    // More aggressive deficit = higher protein
    proteinGKg = activityLevel === 'very' || activityLevel === 'extremely'
      ? 2.4  // High training volume during cut
      : 2.2  // Moderate training volume
  } else if (goal === 'bulk') {
    // Bulking: 1.6-2.0 g/kg for muscle building
    proteinGKg = activityLevel === 'very' || activityLevel === 'extremely'
      ? 1.8  // High training volume
      : 1.6  // Moderate training volume
  } else {
    // Maintain/recomp: 1.8-2.0 g/kg
    proteinGKg = 1.8
  }

  return Math.round(weightKg * proteinGKg)
}
```

**Rationale**:
- Aligns with ISSN recommendations (1.6-2.0 g/kg bulk, 2.0-3.0 g/kg cut)
- Activity level matters more than experience level
- Simpler and evidence-based

### Change 2: Add Minimum Fat Validation

```typescript
function calculateFatNeeds(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  activityLevel: ActivityLevel
): number {
  // Calculate percentage-based fat
  let fatPercentage: number

  if (goal === 'cut') {
    fatPercentage = 0.25  // 25% for satiety and hormones
  } else if (goal === 'bulk') {
    fatPercentage = activityLevel === 'very' || activityLevel === 'extremely'
      ? 0.20  // Lower for high-volume training (more carbs)
      : 0.25  // Moderate training
  } else {
    fatPercentage = 0.25  // Maintenance
  }

  const fatFromPercentage = Math.round((targetCalories * fatPercentage) / 9)

  // Ensure minimum for hormone production (0.5-1.0 g/kg)
  const minFatGrams = Math.round(weightKg * 0.5)

  return Math.max(fatFromPercentage, minFatGrams)
}
```

### Change 3: Update Function Signature

Remove `experienceLevel` parameter since it's not evidence-based:

```typescript
export function calculateMacros(
  targetCalories: number,
  goal: Goal,
  weight: number,
  weightUnit: 'lbs' | 'kg',
  activityLevel?: ActivityLevel  // Keep this - it matters!
): MacroCalculation
```

---

## User's Example Re-Calculated (Evidence-Based)

**Stats**: 88kg, male, very active (5x/week), bulk

**Old Calculation** (my incorrect implementation):
- Protein: 204g (2.32 g/kg) ❌ TOO HIGH
- Fat: 49g (0.56 g/kg) ✓
- Carbs: 242g ❌ TOO LOW

**Evidence-Based Calculation** (ISSN recommendations):
- TDEE: ~2800-3200 cal (estimated for 88kg very active male)
- Target: 3080 cal (10% surplus)
- **Protein**: 88kg × 1.8 g/kg = **158g** (632 cal)
- **Fat**: 3080 × 0.20 / 9 = **68g** (616 cal)
- **Carbs**: (3080 - 632 - 616) / 4 = **458g** (1832 cal)

**User's Actual Macros**:
- 180g protein (2.05 g/kg) - slightly above research range but reasonable
- 330g carbs
- 80g fat
- Total: ~2760 cal

**Analysis**: User's TDEE is likely ~2500-2700, putting their bulk at 10-15% surplus. Their protein (2.05 g/kg) is at the high end but within reasonable ranges. The evidence-based calculation would be:

- TDEE: 2700 cal (user's maintenance)
- Bulk target: 2970 cal (10% surplus)
- Protein: 88kg × 1.8 = **158g** (closer to research, but user preference at 180g is fine)
- Fat: 2970 × 0.20 / 9 = **66g** (user at 80g = reasonable)
- Carbs: (2970 - 632 - 594) / 4 = **436g** (user at 330g suggests lower TDEE)

---

## Bottom Line

1. **My original fix was not evidence-based** - I used too high protein multipliers
2. **ISSN recommendations**: 1.6-2.0 g/kg bulk, 2.0-3.0 g/kg cut
3. **Experience level is NOT a primary factor** - training volume/activity level matters more
4. **BMI is not used** ✓ (we use Mifflin-St Jeor with weight + height)
5. **Need to update protein calculations** to match research

Should I implement these evidence-based corrections?
