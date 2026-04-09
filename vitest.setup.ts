/**
 * Vitest Setup File
 * Runs before all test files
 */

// Set test environment variables
process.env.FATSECRET_CLIENT_ID = 'test-client-id'
process.env.FATSECRET_CLIENT_SECRET = 'test-client-secret'
process.env.RECIPE_API_KEY = 'test-recipe-api-key'
process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
