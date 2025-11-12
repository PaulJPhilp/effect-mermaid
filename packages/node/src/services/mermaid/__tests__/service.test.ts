import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { NodeMermaid } from "../service.js";

describe("NodeMermaid Service", () => {
  describe("render", () => {
    it("renders basic flowchart", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B");

        expect(result).toContain("<svg");
        expect(result).toContain("A");
        expect(result).toContain("B");
        expect(result).toMatch(/<svg[^>]*>/);
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("renders sequence diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("sequenceDiagram\n  Alice->>Bob: Hello");

        expect(result).toContain("<svg");
        expect(result).toContain("Alice");
        expect(result).toContain("Bob");
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("fails on empty diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* Effect.flip(mermaid.render(""));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("fails on invalid diagram syntax", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* Effect.flip(mermaid.render("invalid syntax here"));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Render");
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("applies theme configuration", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "dark"
        });

        expect(result).toContain("<svg");
        // Note: Theme application might not be visible in the SVG output
        // but the config should be applied without errors
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("renders with dark theme - Node.js", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "dark"
        });

        expect(result).toContain("<svg");
        expect(result.length > 0).toBe(true);
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("renders with forest theme - Node.js", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "forest"
        });

        expect(result).toContain("<svg");
        expect(result.length > 0).toBe(true);
      }).pipe(Effect.provide(NodeMermaid.Default)));

    it("renders with neutral theme - Node.js", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* mermaid.render("graph TD\n  A-->B", {
          theme: "neutral"
        });

        expect(result).toContain("<svg");
        expect(result.length > 0).toBe(true);
      }).pipe(Effect.provide(NodeMermaid.Default)));
  });

  describe("detectType", () => {
    const testCases = [
      { diagram: "graph TD\n  A-->B", expected: "flowchart" },
      { diagram: "flowchart TD\n  A-->B", expected: "flowchart" },
      { diagram: "sequenceDiagram\n  Alice->>Bob: Hi", expected: "sequence" },
      { diagram: "classDiagram\n  class Animal", expected: "class" },
      { diagram: "stateDiagram\n  [*] --> State1", expected: "state" },
      { diagram: "gantt\n  title A Gantt Diagram", expected: "gantt" },
      { diagram: "unknown syntax", expected: "unknown" },
    ];

    testCases.forEach(({ diagram, expected }) => {
      it(`detects ${expected}`, () =>
        Effect.gen(function* () {
          const mermaid = yield* NodeMermaid;
          const result = yield* mermaid.detectType(diagram);

          expect(result).toBe(expected);
        }).pipe(Effect.provide(NodeMermaid.Default)));
    });

    it("fails on empty diagram", () =>
      Effect.gen(function* () {
        const mermaid = yield* NodeMermaid;
        const result = yield* Effect.flip(mermaid.detectType(""));

        expect(result._tag).toBe("MermaidError");
        expect(result.reason).toBe("Parse");
      }).pipe(Effect.provide(NodeMermaid.Default)));
  });
});
