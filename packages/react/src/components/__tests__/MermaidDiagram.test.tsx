// Setup testing environment
import "@testing-library/jest-dom/vitest"

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

// Mock mermaid module first (before any imports that use it)
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(() => Promise.resolve()),
    render: vi.fn(() => Promise.resolve({ svg: "<svg>Mock</svg>" })),
  },
}));

import { MermaidDiagram } from "../MermaidDiagram.js";
import { MermaidProvider } from "../MermaidProvider.js";

describe("MermaidDiagram", () => {
  const diagram = `graph TD
    A[Start] --> B[End]`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MermaidProvider>{children}</MermaidProvider>
  );

  it("validates empty diagrams and shows error", () => {
    render(<MermaidDiagram diagram="  " />, { wrapper });

    // Empty diagram validation should show error immediately
    expect(screen.getByText("Diagram Error")).toBeInTheDocument();
    expect(screen.getByText("Diagram cannot be empty")).toBeInTheDocument();
  });

  it("renders without provider and shows error state", () => {
    // Render without wrapper (no MermaidProvider)
    render(<MermaidDiagram diagram={diagram} />);

    // Should show error about service not being initialized
    expect(screen.getByText("Diagram Error")).toBeInTheDocument();
  });

  it("handles config prop structure", () => {
    const config = { theme: "dark" as const };
    const { container } = render(
      <MermaidDiagram diagram={diagram} config={config} />,
      { wrapper }
    );

    // Component should render even if initialization is pending
    expect(container).toBeInTheDocument();
  });

  it("accepts all optional props", () => {
    const onRender = vi.fn();
    const onError = vi.fn();

    const { container } = render(
      <MermaidDiagram
        diagram={diagram}
        config={{ theme: "dark" }}
        className="test-class"
        style={{ border: "1px solid red" }}
        onRender={onRender}
        onError={onError}
      />,
      { wrapper }
    );

    expect(container).toBeInTheDocument();
  });
});
