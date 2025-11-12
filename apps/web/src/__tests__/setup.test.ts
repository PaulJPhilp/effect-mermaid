import { test, expect, describe } from 'vitest'

describe('Setup Verification', () => {
  test('vitest is configured correctly', () => {
    expect(true).toBe(true)
  })

  test('jsdom environment is available', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  test('testing-library/jest-dom matchers are available', () => {
    const div = document.createElement('div')
    expect(div).toBeInTheDocument()
  })
})
