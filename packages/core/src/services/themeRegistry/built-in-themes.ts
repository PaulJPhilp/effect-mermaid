import type { DiagramTheme } from "./types.js";

export const BUILT_IN_THEMES: Record<string, DiagramTheme> = {
  default: {
    name: "default",
    colors: {},
  },
  dark: {
    name: "dark",
    colors: {
      background: "#333",
      primaryColor: "#1f1f1f",
      secondaryColor: "#2c2c2c",
      primaryTextColor: "#fff",
      secondaryTextColor: "#eee",
      tertiaryTextColor: "#ddd",
      primaryBorderColor: "#666",
      secondaryBorderColor: "#888",
      tertiaryBorderColor: "#aaa",
      lineColor: "#aaa",
      textColor: "#fff",
    },
  },
  forest: {
    name: "forest",
    colors: {
      background: "#2e3440",
      primaryColor: "#3b4252",
      secondaryColor: "#434c5e",
      primaryTextColor: "#0f3d2e",
      secondaryTextColor: "#0f3d2e",
      tertiaryTextColor: "#0f3d2e",
      primaryBorderColor: "#4c566a",
      secondaryBorderColor: "#5e81ac",
      tertiaryBorderColor: "#81a1c1",
      lineColor: "#a3be8c",
      textColor: "#0f3d2e",
    },
  },
  neutral: {
    name: "neutral",
    colors: {
      background: "#f5f5f5",
      primaryColor: "#ffffff",
      secondaryColor: "#eeeeee",
      primaryTextColor: "#000000",
      secondaryTextColor: "#333333",
      tertiaryTextColor: "#555555",
      primaryBorderColor: "#dddddd",
      secondaryBorderColor: "#cccccc",
      tertiaryBorderColor: "#bbbbbb",
      lineColor: "#aaaaaa",
      textColor: "#000000",
    },
  },
};
