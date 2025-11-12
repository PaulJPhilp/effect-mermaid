import "@testing-library/jest-dom/vitest"
import * as it from "@effect/vitest"

it.addEqualityTesters()

// Ensure document is available globally
if (typeof document === 'undefined') {
  throw new Error('DOM environment not initialized. Check vitest.config.ts')
}
