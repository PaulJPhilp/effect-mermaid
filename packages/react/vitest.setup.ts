// Setup DOM environment and testing library matchers
import "@testing-library/jest-dom/vitest"

// Ensure document is available globally
if (typeof document === 'undefined') {
  throw new Error('DOM environment not initialized. Check vitest.config.ts')
}
