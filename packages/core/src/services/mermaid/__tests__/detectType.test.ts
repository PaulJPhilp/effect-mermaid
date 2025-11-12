import { test, expect, describe } from "vitest";
import { Effect } from "effect";
import { detectDiagramType } from "../detectType.js";
import { MermaidError } from "../../../global/errors.js";

describe("detectDiagramType", () => {
  test("detects flowchart type from 'graph' keyword", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("graph TD\n  A-->B")
    );
    expect(result).toBe("flowchart");
  });

  test("detects flowchart type from 'flowchart' keyword", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("flowchart LR\n  A-->B")
    );
    expect(result).toBe("flowchart");
  });

  test("detects sequence diagram type", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("sequenceDiagram\n  Alice->>Bob: Hi")
    );
    expect(result).toBe("sequence");
  });

  test("detects class diagram type", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("classDiagram\n  class Animal")
    );
    expect(result).toBe("class");
  });

  test("detects state diagram type", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("stateDiagram-v2\n  [*] --> State1")
    );
    expect(result).toBe("state");
  });

  test("detects gantt diagram type", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("gantt\n  title My Gantt")
    );
    expect(result).toBe("gantt");
  });

  test("returns 'unknown' for unrecognized diagram types", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("unknown_diagram\n  something here")
    );
    expect(result).toBe("unknown");
  });

  test("handles leading whitespace in diagram", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("   graph TD\n  A-->B")
    );
    expect(result).toBe("flowchart");
  });

  test("uses first line (trim removes leading newlines)", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("\ngraph TD\n  A-->B")
    );
    // trim().split('\n')[0] will get "\n" then trim to "" then split to [""], but actually the trim is on the whole string first
    // so "\ngraph TD\n  A-->B".trim() = "graph TD\n  A-->B", then split('\n')[0] = "graph TD"
    expect(result).toBe("flowchart");
  });

  test("fails on empty diagram", async () => {
    const result = await Effect.runPromise(
      Effect.flip(detectDiagramType(""))
    );
    expect(result).toBeInstanceOf(MermaidError);
  });

  test("fails on whitespace-only diagram", async () => {
    const result = await Effect.runPromise(
      Effect.flip(detectDiagramType("   \n  \t  "))
    );
    expect(result).toBeInstanceOf(MermaidError);
  });

  test("handles diagram with extra whitespace between keyword and content", async () => {
    const result = await Effect.runPromise(
      detectDiagramType("graph     TD\n  A-->B")
    );
    expect(result).toBe("flowchart");
  });
});
