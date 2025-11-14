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

  return (
    <div className="flex flex-col h-full bg-muted/30 border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Preview</h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Rendering...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!isInitialized ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Initializing Mermaid...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                Rendering Error
              </h3>
              <p className="text-sm text-destructive/90">{error.message}</p>
            </div>
          </div>
        ) : !code.trim() ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-muted-foreground">
              <p className="text-sm mb-1">No diagram to render</p>
              <p className="text-xs text-muted-foreground/70">
                Start typing in the editor on the left
              </p>
            </div>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-sm p-4 border border-border"
            role="presentation"
            aria-label="Rendered diagram"
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

