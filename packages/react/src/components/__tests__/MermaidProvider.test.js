import { jsx as _jsx } from "react/jsx-runtime";
import { beforeEach, describe, expect, it, vi, } from "vitest";
import { render, screen } from "@testing-library/react";
// Mock mermaid module first
vi.mock("mermaid", () => ({
    default: {
        initialize: vi.fn(() => Promise.resolve()),
        render: vi.fn(() => Promise.resolve({ svg: "<svg></svg>" })),
    },
}));
import { MermaidProvider, } from "../MermaidProvider.js";
describe("MermaidProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("renders children without crashing", () => {
        const { container } = render(_jsx(MermaidProvider, { children: _jsx("div", { children: "Test Content" }) }));
        expect(screen.getByText("Test Content")).toBeInTheDocument();
        expect(container).toBeInTheDocument();
    });
    it("provides context for children", () => {
        const TestChild = () => {
            return _jsx("div", { children: "Provider is working" });
        };
        render(_jsx(MermaidProvider, { children: _jsx(TestChild, {}) }));
        expect(screen.getByText("Provider is working")).toBeInTheDocument();
    });
    it("handles initialization errors gracefully", () => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => { });
        render(_jsx(MermaidProvider, { children: _jsx("div", { children: "Test Content" }) }));
        // Provider should render even if initialization fails
        expect(screen.getByText("Test Content")).toBeInTheDocument();
        errorSpy.mockRestore();
    });
});
//# sourceMappingURL=MermaidProvider.test.js.map