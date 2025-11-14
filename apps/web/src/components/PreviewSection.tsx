import React from "react";
import { MermaidDiagram, useMermaidInitialized } from "effect-mermaid-react";
import type { MermaidConfig } from "effect-mermaid";
import { AlertCircle, Loader2 } from "lucide-react";

interface PreviewSectionProps {
  code: string;
  config?: MermaidConfig;
  isLoading?: boolean;
  error?: Error | null;
  onError?: (error: Error) => void;
}

/**
 * PreviewSection - Right panel displaying the rendered Mermaid diagram
 *
 * Responsibilities:
 * - Display rendered diagram
 * - Show loading state
 * - Show error state
 * - Handle initialization state
 *
 * @example
 * ```tsx
 * const { shouldRender, isLoading, error } = useDiagramRender(code, config);
 *
 * return (
 *   <PreviewSection
 *     code={code}
 *     config={config}
 *     isLoading={isLoading}
 *     error={error}
 *     onError={handleError}
 *   />
 * );
 * ```
 */
export const PreviewSection: React.FC<PreviewSectionProps> = ({
  code,
  config,
  isLoading = false,
  error = null,
  onError,
}) => {
  const isInitialized = useMermaidInitialized();

  const hasCode = code.trim().length > 0;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Rendering…</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-auto px-4 py-4">
        {!isInitialized ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Initializing Mermaid…
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-destructive">
                Rendering Error
              </h3>
              <p className="text-xs text-destructive/90">{error.message}</p>
            </div>
          </div>
        ) : !hasCode ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div className="text-muted-foreground">
              <p className="mb-1 text-sm">No diagram to render</p>
              <p className="text-xs text-muted-foreground/70">
                Start typing in the editor on the left
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-[240px] flex-1 items-center justify-center rounded-md border border-border bg-muted/60 p-4"
            role="region"
            aria-label="Diagram preview"
          >
            <MermaidDiagram
              diagram={code}
              config={config}
              onError={onError}
              className="flex justify-center"
            />
          </div>
        )}
      </div>
    </div>
  );
};

