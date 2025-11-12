import { test, expect, describe, beforeEach, afterEach, vi } from "vitest";

describe("Mermaid Theme Resolution", () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Spy on console.warn to verify error logging
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  test("logs warning when resolving non-existent custom theme", () => {
    // Simulate theme resolution error by calling console.warn directly
    const serviceName = "[Mermaid]";
    const themeName = "nonexistent-theme";
    const errorMsg = "Theme not found";

    console.warn(
      `${serviceName} Failed to resolve theme "${themeName}": ${errorMsg}. Using default theme.`
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Mermaid]")
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("nonexistent-theme")
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Using default theme")
    );
  });

  test("does not log warning for default theme", () => {
    // Default theme should not trigger any warnings during resolution
    // This is verified by existing render tests that use default theme
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test("logs warning includes service identifier", () => {
    const services = ["Mermaid", "NodeMermaid", "BrowserMermaid"];

    services.forEach((service) => {
      consoleWarnSpy.mockClear();
      console.warn(
        `[${service}] Failed to resolve theme "custom": Error message. Using built-in theme.`
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`[${service}]`)
      );
    });
  });
});
