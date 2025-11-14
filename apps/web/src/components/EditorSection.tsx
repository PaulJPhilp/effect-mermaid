import React from "react";
import { CodeMirrorEditor } from "./CodeMirrorEditor";
import { SyntaxErrorDisplay } from "./SyntaxErrorDisplay";
import { useEditorState } from "../hooks/useEditorState";
import { Button } from "./ui/button";

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

  const hasErrors = errors.errors.length > 0;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-foreground">
            Diagram Source
          </h2>
          <p className="text-xs text-muted-foreground">
            Edit Mermaid diagram syntax
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {lineCount} lines
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearCode}
            className="text-xs"
            aria-label="Clear editor contents"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirrorEditor value={code} onChange={setCode} />
      </div>

      {/* Error Display */}
      {hasErrors && (
        <div className="border-t border-destructive/20 bg-destructive/5">
          <SyntaxErrorDisplay errors={errors} onDismiss={clearCode} />
        </div>
      )}
    </div>
  );
};

