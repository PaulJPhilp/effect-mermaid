import React from "react";
import { AlertCircle, X, ExternalLink, BookOpen } from "lucide-react";
import type { SyntaxErrorInfo } from "../hooks/useEditorState";
import { Button } from "./ui/button";

interface SyntaxErrorDisplayProps {
  errors: SyntaxErrorInfo;
  onDismiss?: () => void;
}

/**
 * Displays syntax errors from the diagram editor in a user-friendly format
 *
 * Shows:
 * - Error count badge
 * - List of errors with line numbers
 * - Optional dismiss button
 *
 * @example
 * ```tsx
 * const { errors } = useEditorState(DEFAULT_DIAGRAM);
 *
 * return (
 *   <>
 *     {errors.errors.length > 0 && (
 *       <SyntaxErrorDisplay
 *         errors={errors}
 *         onDismiss={() => clearCode()}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const SyntaxErrorDisplay: React.FC<SyntaxErrorDisplayProps> = ({
  errors,
  onDismiss,
}) => {
  if (errors.errors.length === 0) {
    return null;
  }

  const errorCount = errors.errors.length;
  const hasWarnings = errors.errors.some((e) => e.type === "warning");
  const hasErrors = errors.errors.some((e) => e.type === "error");

  return (
    <div className="border-t border-destructive/20 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-destructive">
              {hasErrors ? "Syntax Errors" : "Warnings"} ({errorCount})
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                aria-label="Dismiss errors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            )}
          </div>

          {/* Error list */}
          <div className="space-y-1 text-sm text-destructive/90">
            {errors.errors.map((error, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-xs text-destructive/70 min-w-fit">
                  Line {error.line}:
                </span>
                <span className="text-destructive">{error.message}</span>
              </div>
            ))}
          </div>

          {/* Diagnostics */}
          {errors.diagnostics.length > 0 && (
            <div className="mt-3 pt-2 border-t border-destructive/10">
              <p className="mb-1 text-xs font-semibold text-destructive/70">
                Suggestions:
              </p>
              <ul className="mb-2 space-y-1 text-xs text-destructive/80">
                {errors.diagnostics.map((diag, i) => (
                  <li key={i} className="flex gap-2">
                    <span>•</span>
                    <span>{diag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help links */}
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-destructive/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                window.open(
                  "https://mermaid.js.org/intro/getting-started.html",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              <BookOpen className="mr-1.5 h-3 w-3" />
              Mermaid Docs
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                window.open(
                  "https://mermaid.js.org/syntax/flowchart.html",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Syntax Guide
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

