import { Atom } from "@effect-atom/atom-react";
import { Schema } from "effect";

// Type-safe schemas for theme builder state
const ColorMapSchema = Schema.Record({
  key: Schema.String,
  value: Schema.String, // hex color values
});

const CustomThemeSchema = Schema.Struct({
  name: Schema.String,
  colors: ColorMapSchema,
  description: Schema.optional(Schema.String),
});

const CustomThemesMapSchema = Schema.Record({
  key: Schema.String,
  value: CustomThemeSchema,
});

export type CustomTheme = Schema.Schema.Type<typeof CustomThemeSchema>;
export type CustomThemesMap = Schema.Schema.Type<typeof CustomThemesMapSchema>;

// Atoms for theme builder state
export const currentThemeAtom = Atom.make("default" as string);

export const customThemesAtom = Atom.make({} as CustomThemesMap);

export const sidebarOpenAtom = Atom.make(false);

export const editingThemeAtom = Atom.make(null as string | null);

// Initialize atom runtime with localStorage persistence
export const getStoredThemes = (): CustomThemesMap => {
  try {
    const stored = localStorage.getItem("effect-mermaid-custom-themes");
    if (!stored) return {};
    return JSON.parse(stored) as CustomThemesMap;
  } catch {
    return {};
  }
};

export const getStoredCurrentTheme = (): string => {
  try {
    const stored = localStorage.getItem("effect-mermaid-current-theme");
    return stored || "default";
  } catch {
    return "default";
  }
};

// Note: Atoms initialized lazily through useAtom hooks

// Persistence helpers
export const persistCustomThemes = (themes: CustomThemesMap) => {
  try {
    localStorage.setItem("effect-mermaid-custom-themes", JSON.stringify(themes));
  } catch (e) {
    console.warn("Failed to persist custom themes:", e);
  }
};

export const persistCurrentTheme = (theme: string) => {
  try {
    localStorage.setItem("effect-mermaid-current-theme", theme);
  } catch (e) {
    console.warn("Failed to persist current theme:", e);
  }
};
