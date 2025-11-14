import { useCallback, useEffect, useState } from "react";
import { getSyntaxErrorsWithContext } from "../utils/syntaxChecker";

/**
 * Information about syntax errors in the diagram code
 */
export interface SyntaxErrorInfo {
  errors: Array<{
    line: number;
    column?: number;
    message: string;
    type: "error" | "warning";
  }>;
  diagnostics: string[];
}

/**
 * Hook for managing diagram code and syntax errors
 *
 * Handles:
 * - Storing diagram source code
 * - Debounced syntax checking
 * - Line count tracking
 * - Clearing code/errors
 *
 * @param defaultDiagram - Initial diagram code
 * @returns Code, errors, and control functions
 *
 * @example
 * ```typescript
 * const { code, setCode, errors, lineCount, clearCode } = useEditorState(
 *   "graph TD\n  A-->B"
 * );
 *
 * return (
 *   <CodeMirrorEditor
 *     value={code}
 *     onChange={setCode}
 *     errors={errors}
 *   />
 * );
 * ```
 */
export function useEditorState(defaultDiagram: string) {
  const [code, setCode] = useState(defaultDiagram);
  const [syntaxErrors, setSyntaxErrors] = useState<SyntaxErrorInfo>({
    errors: [],
    diagnostics: [],
  });
  const [lineCount, setLineCount] = useState(
    defaultDiagram.split("\n").length
  );

  // Update line count when code changes
  useEffect(() => {
    setLineCount(code.split("\n").length);
  }, [code]);

  // Debounced syntax checking
  useEffect(() => {
    const checkSyntax = async () => {
      const result = await getSyntaxErrorsWithContext(code);
      setSyntaxErrors(result);
    };

    const timer = setTimeout(() => {
      checkSyntax();
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  const clearCode = useCallback(() => {
    setCode("");
    setSyntaxErrors({ errors: [], diagnostics: [] });
  }, []);

  const resetToDefault = useCallback(() => {
    setCode(defaultDiagram);
    setSyntaxErrors({ errors: [], diagnostics: [] });
  }, [defaultDiagram]);

  return {
    code,
    setCode,
    errors: syntaxErrors,
    lineCount,
    clearCode,
    resetToDefault,
  };
}

