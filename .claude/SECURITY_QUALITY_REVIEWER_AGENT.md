# Security-Quality-Reviewer Agent Reference

## Purpose
Use this agent when code implementation is **COMPLETE** and needs comprehensive review before shipping. This includes security audits, quality validation, and requirements verification.

## When to Use (Proactively Trigger)

### ✅ Required Scenarios
1. **After completing authentication/authorization features**
   - OAuth implementations
   - Login/signup flows
   - Session management
   - JWT handling

2. **After creating/modifying API endpoints**
   - User data CRUD operations
   - Payment processing endpoints
   - File upload endpoints
   - Any endpoint handling sensitive data

3. **After database schema changes**
   - New tables created
   - RLS policies added/modified
   - Foreign key relationships
   - Migration files

4. **After completing planned features**
   - Feature marked as "done"
   - Before creating pull request
   - Before merging to main branch

5. **After substantial code changes**
   - Refactoring security-critical code
   - Updating dependencies with security implications
   - Changing data validation logic

### ❌ Do NOT Use When
- Code is incomplete/in-progress
- Just exploring/researching
- Writing documentation only
- Making trivial changes (typos, comments)

## What the Agent Reviews

### Security Audit
- **Authentication & Authorization**
  - Proper auth checks on all protected routes
  - Session management security
  - Token validation

- **Database Security**
  - Row Level Security (RLS) policies present and correct
  - SQL injection prevention (parameterized queries)
  - Proper foreign key constraints

- **Input Validation**
  - Zod schemas for all user inputs
  - Server-side validation (never trust client)
  - XSS prevention (proper sanitization)

- **API Security**
  - Rate limiting considerations
  - Proper error handling (no sensitive data leaks)
  - CORS configuration

- **Environment Variables**
  - No hardcoded secrets
  - Proper .env.local usage
  - All sensitive config in environment

### Code Quality
- **TypeScript**
  - Proper typing throughout
  - No `any` types without justification
  - Type safety in API boundaries

- **Next.js Best Practices**
  - Proper Server/Client Component separation
  - Server Actions used correctly
  - App Router patterns followed

- **Supabase Patterns**
  - SSR implementation correct
  - Proper client creation (server vs browser)
  - Efficient queries (no N+1 problems)

- **Performance**
  - Database indexes on foreign keys
  - Efficient query patterns
  - No unnecessary re-renders

### Requirements Verification
- All specified features implemented
- Edge cases handled
- Error states implemented
- Loading states implemented

## How to Invoke

### Template Prompt Structure

```markdown
Perform a comprehensive security audit and quality review of [FEATURE_NAME].

**Context**: [Brief description of what was implemented]

**Files Changed**:
- Modified: [list files]
- New: [list files]

**Review Focus**:
1. Security: [specific security concerns for this feature]
2. Database: [RLS policies, schema, indexes]
3. Code Quality: [TypeScript, patterns, best practices]
4. Performance: [queries, N+1, indexes]
5. Requirements: [what the feature should do]

**Critical Areas**:
[List any particularly sensitive areas that need extra scrutiny]

Provide:
1. **Critical Issues** (must fix before shipping)
2. **Important Issues** (should fix)
3. **Suggestions** (nice to have)
4. **Positive Findings** (things done well)
```

### Example: Recipe Feature Review

```markdown
Perform a comprehensive security audit and quality review of the recipe dashboard implementation.

**Context**: Implemented a complete recipe browsing system with favorites, search, filtering, and detail pages for a nutrition tracking app (Next.js 16, React 19, Supabase, TypeScript).

**Files Changed**:
- Modified: app/recipes/page.tsx, app/globals.css, lib/design-tokens.ts, next.config.ts
- New:
  - app/recipes/[id]/ (recipe detail page)
  - app/recipes/actions.ts (server actions)
  - app/recipes/error.tsx, loading.tsx
  - components/recipes/ (all recipe components)
  - lib/types/recipe.ts
  - supabase/migrations/20251118123008_create_recipes_schema.sql

**Review Focus**:
1. Security: RLS policies on recipes tables, auth checks in favorites, input sanitization in search
2. Database: Verify migration has proper RLS, indexes on foreign keys, check for N+1 query patterns
3. Code Quality: TypeScript types, Server/Client component separation, error handling
4. Performance: Recipe list query efficiency, favorite checks, image loading
5. Requirements: Recipe browsing, search, filtering by tags, favorites system

**Critical Areas**:
- user_favorite_recipes RLS policies (users should only access their own favorites)
- Search query construction (SQL injection prevention)
- Recipe image URLs (external images from Google)
- Favorites toggle authentication

Provide:
1. **Critical Issues** (must fix before shipping)
2. **Important Issues** (should fix)
3. **Suggestions** (nice to have)
4. **Positive Findings** (things done well)
```

## Strict Guidelines

### Before Invoking
1. ✅ Ensure implementation is COMPLETE
2. ✅ Gather all relevant file paths
3. ✅ Know what the feature is supposed to do
4. ✅ Identify security-critical areas
5. ✅ List database changes (migrations)

### In the Prompt
1. ✅ Provide full context about the feature
2. ✅ List ALL changed/new files
3. ✅ Specify what to focus on
4. ✅ Highlight critical security areas
5. ✅ Request structured output (Critical/Important/Suggestions/Positive)

### After Review
1. ✅ Address ALL critical issues immediately
2. ✅ Plan to fix important issues
3. ✅ Consider suggestions for future iterations
4. ✅ Do NOT merge until critical issues resolved

## Red Flags to Always Check

### 🚨 Security Red Flags
- [ ] Missing RLS policies on tables with user data
- [ ] No authentication check before modifying data
- [ ] String concatenation in SQL queries
- [ ] User input not validated with Zod
- [ ] Secrets in code (API keys, tokens)
- [ ] No error handling (exposing stack traces)

### ⚠️ Quality Red Flags
- [ ] Using `any` type extensively
- [ ] Client Components fetching data (should be Server)
- [ ] No loading/error states
- [ ] Missing TypeScript types
- [ ] No indexes on foreign keys
- [ ] N+1 query patterns

## Integration with Workflow

### Standard Development Flow
1. **Plan** → Use planning agent
2. **Implement** → Write code
3. **Review** → **USE THIS AGENT** ⭐
4. **Fix** → Address critical issues
5. **Verify** → Re-review if needed
6. **Ship** → Create PR/merge

### When User Says
- "Review my code" → Use this agent
- "Check for security issues" → Use this agent
- "Is this ready to ship?" → Use this agent
- "Audit my implementation" → Use this agent
- "Done with [feature]" → Proactively suggest using this agent

## Notes
- Agent has access to ALL tools (Read, Grep, Glob, Bash, etc.)
- Agent will read files, run scans, check migrations
- Agent operates autonomously - provide complete context upfront
- Agent returns ONE final report (can't ask follow-up questions)
- Agent's findings should be TRUSTED and acted upon
