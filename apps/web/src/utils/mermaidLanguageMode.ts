import { Language, StreamLanguage, StringStream } from '@codemirror/language'

/**
 * Regex-based tokenizer for Mermaid diagram syntax
 * Provides syntax highlighting for various Mermaid diagram types
 */
const mermaidTokenizer = StreamLanguage.define({
  token(stream: StringStream) {
    // Skip whitespace
    if (stream.eatSpace()) return null

    // Handle comments
    if (stream.match('%%')) {
      stream.skipToEnd()
      return 'comment'
    }

    // Handle strings with brackets
    if (stream.eat('[')) {
      let escaped = false
      while (!stream.eol()) {
        if (escaped) {
          escaped = false
          stream.next()
        } else if (stream.eat(']')) {
          return 'string'
        } else if (stream.next() === '\\') {
          escaped = true
        }
      }
      return 'string'
    }

    // Handle strings with pipes
    if (stream.eat('|')) {
      let escaped = false
      while (!stream.eol()) {
        if (escaped) {
          escaped = false
          stream.next()
        } else if (stream.eat('|')) {
          return 'string'
        } else if (stream.next() === '\\') {
          escaped = true
        }
      }
      return 'string'
    }

    // Handle quoted strings
    if (stream.eat('"')) {
      let escaped = false
      while (!stream.eol()) {
        if (escaped) {
          escaped = false
          stream.next()
        } else if (stream.eat('"')) {
          return 'string'
        } else if (stream.next() === '\\') {
          escaped = true
        }
      }
      return 'string'
    }

    // Handle operators (arrows and connections)
    if (stream.match('====>')) return 'operator'
    if (stream.match('--->')) return 'operator'
    if (stream.match('-.->')) return 'operator'
    if (stream.match('-.-')) return 'operator'
    if (stream.match('-->')) return 'operator'
    if (stream.match('==')) return 'operator'
    if (stream.match('--')) return 'operator'
    if (stream.match('-|')) return 'operator'
    if (stream.match('|-')) return 'operator'
    if (stream.match('o-')) return 'operator'
    if (stream.match('-o')) return 'operator'
    if (stream.match('x-')) return 'operator'
    if (stream.match('-x')) return 'operator'
    if (stream.eat('<') || stream.eat('>') || stream.eat('=')) {
      return 'operator'
    }

    // Handle numbers
    if (stream.match(/^\d+(\.\d+)?/)) {
      return 'number'
    }

    // Handle Mermaid diagram keywords
    if (
      stream.match(
        /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|sankey|requirementDiagram|xychart)/
      )
    ) {
      return 'keyword'
    }

    // Handle direction keywords
    if (stream.match(/^(TD|BT|LR|RL|TB|DT)/)) {
      return 'keyword'
    }

    // Handle control keywords
    if (
      stream.match(
        /^(end|else|if|then|par|and|opt|alt|break|loop|rect|critical|neg|assert|strict|seq|ignore|consider|exc|type|bool|number|string|enum|actor|boundary|control|entity|database|collections)/
      )
    ) {
      return 'keyword'
    }

    // Handle special keywords
    if (stream.match(/^(subgraph|node|class|state|event|message|note|actor|rect)/)) {
      return 'keyword'
    }

    // Handle directions in state diagrams
    if (stream.match(/^(left|right|up|down)/)) {
      return 'atom'
    }

    // Handle punctuation
    if (stream.eat('{') || stream.eat('}')) {
      return 'punctuation'
    }

    // Handle parentheses and brackets
    if (stream.eat('(') || stream.eat(')')) {
      return 'punctuation'
    }

    // Handle semicolons
    if (stream.eat(';')) {
      return 'punctuation'
    }

    // Handle colons
    if (stream.eat(':')) {
      return 'punctuation'
    }

    // Handle commas
    if (stream.eat(',')) {
      return 'punctuation'
    }

    // Everything else is an identifier
    stream.eatWhile(/[^\s[\]|()\-\->;:,]/)
    return 'variable'
  },
})

/**
 * Create Mermaid language mode for CodeMirror 6
 * Returns a Language object that can be used as an extension
 */
export const createMermaidLanguage = () => {
  return mermaidTokenizer
}
