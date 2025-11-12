import mermaid from 'mermaid'

export interface SyntaxError {
  line: number
  column?: number
  message: string
  type: 'error' | 'warning'
}

/**
 * Check Mermaid diagram syntax and return any errors found
 * Uses Mermaid's internal validation capabilities
 */
export const checkSyntax = async (diagram: string): Promise<SyntaxError[]> => {
  if (!diagram.trim()) {
    return []
  }

  const errors: SyntaxError[] = []

  try {
    // Try to parse the diagram using Mermaid's parser
    // This will throw if there's a syntax error
    await mermaid.parse(diagram, { suppressErrors: false })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Try to extract line information from error message
    const lineMatch = errorMessage.match(/line (\d+)/i)
    const line = lineMatch ? parseInt(lineMatch[1], 10) : 1

    errors.push({
      line,
      message: errorMessage,
      type: 'error'
    })
  }

  return errors
}

/**
 * Get detailed syntax errors with more context about the diagram
 * Analyzes the diagram structure to provide helpful feedback
 */
export const getSyntaxErrorsWithContext = async (
  diagram: string
): Promise<{ errors: SyntaxError[]; diagnostics: string[] }> => {
  const errors = await checkSyntax(diagram)
  const diagnostics: string[] = []

  // Check for common issues
  if (!diagram.trim()) {
    diagnostics.push('Diagram is empty')
  } else {
    const firstLine = diagram.split('\n')[0].trim()

    // Check if diagram has a valid diagram type
    const validTypes = [
      'graph', 'flowchart', 'sequenceDiagram', 'sequence',
      'classDiagram', 'class', 'stateDiagram', 'state',
      'erDiagram', 'gantt', 'pie', 'gitGraph', 'git',
      'journey', 'mindmap', 'timeline', 'sankey'
    ]

    const hasValidType = validTypes.some(type => firstLine.toLowerCase().startsWith(type))
    if (!hasValidType && firstLine && !firstLine.startsWith('%')) {
      diagnostics.push(
        `First line should start with a valid diagram type (e.g., "graph TD" or "sequenceDiagram")`
      )
    }
  }

  // Check for common syntax issues
  const lines = diagram.split('\n')
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('%')) return // Skip empty lines and comments

    // Check for unmatched brackets
    const openBrackets = (line.match(/[\[\{]/g) || []).length
    const closeBrackets = (line.match(/[\]\}]/g) || []).length
    if (openBrackets > closeBrackets) {
      diagnostics.push(`Line ${index + 1}: Possible unclosed bracket`)
    }
  })

  return { errors, diagnostics }
}

/**
 * Highlight the lines with errors in the diagram
 */
export const getErrorLines = async (diagram: string): Promise<number[]> => {
  const errors = await checkSyntax(diagram)
  return [...new Set(errors.map(e => e.line))]
}
