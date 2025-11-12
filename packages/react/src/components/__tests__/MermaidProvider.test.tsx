import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { render, screen } from "@testing-library/react";

// Mock mermaid module first
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(() => Promise.resolve()),
    render: vi.fn(() => Promise.resolve({ svg: "<svg></svg>" })),
  },
}));

import {
  MermaidProvider,
} from "../MermaidProvider.js";

describe("MermaidProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children without crashing", () => {
    const { container } = render(
      <MermaidProvider>
        <div>Test Content</div>
      </MermaidProvider>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it("provides context for children", () => {
    const TestChild = () => {
      return <div>Provider is working</div>;
    };

    render(
      <MermaidProvider>
        <TestChild />
      </MermaidProvider>
    );

    expect(screen.getByText("Provider is working")).toBeInTheDocument();
  });

  it("handles initialization errors gracefully", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <MermaidProvider>
        <div>Test Content</div>
      </MermaidProvider>
    );

    // Provider should render even if initialization fails
    expect(screen.getByText("Test Content")).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
