import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { createMermaidLanguage } from '../utils/mermaidLanguageMode'
import '../styles/mermaidEditorTheme.css'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * CodeMirror-based code editor component
 * Provides syntax highlighting and improved editing experience
 */
export const CodeMirrorEditor = React.forwardRef<
  HTMLDivElement,
  CodeMirrorEditorProps
>(
  (
    { value, onChange, placeholder, className, style },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...style,
        }}
      >
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[createMermaidLanguage()]}
          height="100%"
          theme="light"
          basicSetup={{
            lineNumbers: true,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: false,
          }}
          style={{
            flex: 1,
            fontSize: '13px',
            fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
          }}
          className="codemirror-editor"
          indentWithTab={true}
        />
      </div>
    )
  }
)

CodeMirrorEditor.displayName = 'CodeMirrorEditor'
