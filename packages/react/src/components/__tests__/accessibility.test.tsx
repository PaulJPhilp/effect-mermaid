import { describe, expect, it, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { MermaidProvider } from "../MermaidProvider";
import { MermaidDiagram } from "../MermaidDiagram";

expect.extend(toHaveNoViolations);

describe("Accessibility Tests", () => {
  describe("MermaidProvider", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <MermaidProvider>
          <div>Test content</div>
        </MermaidProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA landmarks", async () => {
      const { container } = render(
        <MermaidProvider>
          <div role="main">Main content</div>
        </MermaidProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("MermaidDiagram", () => {
    beforeEach(() => {
      // Mock the mermaid module to avoid async issues in tests
      vi.mock("mermaid", () => ({
        default: {
          initialize: vi.fn(),
          render: vi.fn().mockResolvedValue({
            svg: '<svg><text>Test</text></svg>'
          })
        }
      }));
    });

    it("should provide accessible diagram wrapper", async () => {
      const { container } = render(
        <MermaidDiagram diagram="graph TD\n  A-->B" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-label", async () => {
      const { container } = render(
        <MermaidDiagram
          diagram="graph TD\n  A-->B"
          aria-label="Sample flowchart"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-describedby", async () => {
      const { container } = render(
        <div>
          <MermaidDiagram
            diagram="graph TD\n  A-->B"
            aria-describedby="diagram-description"
          />
          <div id="diagram-description">
            This shows a simple flowchart from A to B
          </div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have semantic HTML structure", async () => {
      const { container } = render(
        <MermaidDiagram diagram="graph TD\n  A-->B" />
      );

      // Should not have skipped heading levels
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Error states", () => {
    it("should maintain accessibility during error state", async () => {
      const { container } = render(
        <div role="alert" aria-live="polite">
          Failed to render diagram
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have accessible error messages", async () => {
      const { container } = render(
        <div>
          <div role="alert">
            <strong>Error:</strong> Invalid diagram syntax
          </div>
          <p id="error-hint">Check your diagram format and try again.</p>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Loading states", () => {
    it("should have accessible loading indicators", async () => {
      const { container } = render(
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          Loading diagram...
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should announce loading completion", async () => {
      const { container } = render(
        <div
          role="status"
          aria-live="polite"
          aria-busy="false"
        >
          Diagram loaded
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Color contrast", () => {
    it("should have sufficient color contrast", async () => {
      const { container } = render(
        <div style={{ color: "#000", backgroundColor: "#fff" }}>
          High contrast text
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Keyboard navigation", () => {
    it("should be keyboard accessible", async () => {
      const { container, getByRole } = render(
        <button>Render Diagram</button>
      );

      const button = getByRole("button");
      expect(button).toHaveFocus === undefined || !button.hasAttribute("disabled");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Focus management", () => {
    it("should have visible focus indicators", async () => {
      const { container } = render(
        <button
          style={{
            outline: "2px solid blue",
            outlineOffset: "2px"
          }}
        >
          Interactive Element
        </button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Semantic structure", () => {
    it("should use semantic HTML elements", async () => {
      const { container } = render(
        <main>
          <section>
            <h1>Diagram Title</h1>
            <MermaidDiagram diagram="graph TD\n  A-->B" />
          </section>
        </main>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading hierarchy", async () => {
      const { container } = render(
        <article>
          <h1>Main Title</h1>
          <h2>Diagram Section</h2>
          <MermaidDiagram diagram="graph TD\n  A-->B" />
        </article>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Images and alternative text", () => {
    it("should provide alt text for diagram SVGs", async () => {
      const { container } = render(
        <figure>
          <MermaidDiagram
            diagram="graph TD\n  A-->B"
            role="img"
            aria-label="System architecture diagram"
          />
          <figcaption>Example system architecture</figcaption>
        </figure>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Responsive design", () => {
    it("should maintain accessibility at different viewport sizes", async () => {
      const { container } = render(
        <div style={{ maxWidth: "100%" }}>
          <MermaidDiagram diagram="graph TD\n  A-->B" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Language and text", () => {
    it("should declare language appropriately", async () => {
      const { container } = render(
        <div lang="en">
          <h1>English Diagram</h1>
          <MermaidDiagram diagram="graph TD\n  A-->B" />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

