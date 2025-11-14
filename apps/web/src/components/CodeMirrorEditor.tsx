import React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { createMermaidLanguage } from "../utils/mermaidLanguageMode"
import { mermaidLinter } from "../utils/mermaidLinter"
import "../styles/mermaidEditorTheme.css"

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Track whether the app is currently in dark mode by observing the
 * presence of the `dark` class on the document element.
 */
function useIsDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    if (typeof document === "undefined") {
      return false
    }
    return document.documentElement.classList.contains("dark")
  })

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const root = document.documentElement

    const handleUpdate = () => {
      setIsDarkMode(root.classList.contains("dark"))
    }

    handleUpdate()

    const observer = new MutationObserver(() => {
      handleUpdate()
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return isDarkMode
}

/**
 * CodeMirror-based code editor component
 * Provides syntax highlighting and improved editing experience
 */
export const CodeMirrorEditor = React.forwardRef<
  HTMLDivElement,
  CodeMirrorEditorProps
>(function CodeMirrorEditor(
  { value, onChange, placeholder, className, style },
  ref,
) {
  const isDarkMode = useIsDarkMode()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[createMermaidLanguage(), mermaidLinter]}
        height="100%"
        theme={isDarkMode ? "dark" : "light"}
        basicSetup={{
          lineNumbers: true,
          indentOnInput: true,
          bracketMatching: true,
          autocompletion: false,
        }}
        style={{
          flex: 1,
          fontSize: "13px",
          fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
        }}
        className="codemirror-editor"
        indentWithTab={true}
        placeholder={placeholder}
      />
    </div>
  )
})

CodeMirrorEditor.displayName = "CodeMirrorEditor"
