import React from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { SyntaxErrorDisplay } from "./SyntaxErrorDisplay";
import { useEditorState } from "../hooks/useEditorState";

const DEFAULT_DIAGRAM = `graph LR
    A[Start] --> B{Condition}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`;

interface EditorSectionProps {
  onCodeChange: (code: string) => void;
}

/**
 * EditorSection - Left panel containing the Mermaid diagram source editor
 *
 * Responsibilities:
 * - Display the code editor (CodeMirror)
 * - Show syntax errors and warnings
 * - Track line count
 * - Manage editor state (code, errors)
 *
 * @example
 * ```tsx
 * function App() {
 *   const [code, setCode] = useState("");
 *
 *   return (
 *     <EditorSection onCodeChange={setCode} />
 *   );
 * }
 * ```
 */
export const EditorSection: React.FC<EditorSectionProps> = ({
  onCodeChange,
}) => {
  const { code, setCode, errors, lineCount, clearCode } =
    useEditorState(DEFAULT_DIAGRAM);

  // Notify parent when code changes
  React.useEffect(() => {
    onCodeChange(code);
  }, [code, onCodeChange]);

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Diagram Source</h2>
          <p className="text-sm text-muted-foreground">
            Edit Mermaid diagram syntax
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-muted-foreground">
            {lineCount} lines
          </div>
          <button
            onClick={clearCode}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            aria-label="Clear code"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirrorEditor value={code} onChange={setCode} errors={errors} />
      </div>

      {/* Error Display */}
      {errors.errors.length > 0 && (
        <SyntaxErrorDisplay errors={errors} onDismiss={clearCode} />
      )}
    </div>
  );
};

