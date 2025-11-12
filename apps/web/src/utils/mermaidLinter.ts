import { linter, Diagnostic } from '@codemirror/lint'
import { getSyntaxErrorsWithContext } from './syntaxChecker'

/**
 * Create a CodeMirror linter for Mermaid diagrams
 * Displays syntax errors and suggestions inline in the editor
 */
export const mermaidLinter = linter(async (view) => {
  const doc = view.state.doc.toString()
  const diagnostics: Diagnostic[] = []

  try {
    const result = await getSyntaxErrorsWithContext(doc)

    // Convert syntax errors to CodeMirror diagnostics
    result.errors.forEach((error) => {
      const lineStart = view.state.doc.line(error.line).from
      const lineEnd = view.state.doc.line(error.line).to

      diagnostics.push({
        from: lineStart,
        to: lineEnd,
        severity: error.type === 'error' ? 'error' : 'warning',
        message: error.message,
      })
    })

    // Add suggestions as warnings
    result.diagnostics.forEach((diagnostic, index) => {
      // Add diagnostic at the end of the document or at a relevant line
      const pos = Math.min(view.state.doc.length - 1, view.state.doc.length)
      diagnostics.push({
        from: pos,
        to: pos,
        severity: 'info',
        message: diagnostic,
      })
    })
  } catch (error) {
    // Silently handle any errors in the linter itself
    // This ensures the editor continues to work even if linting fails
    console.error('Mermaid linter error:', error)
  }

  return diagnostics
})
