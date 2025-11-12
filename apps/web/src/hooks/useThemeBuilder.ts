import { useAtom } from "@effect-atom/atom-react";
import { useEffect } from "react";
import {
  currentThemeAtom,
  customThemesAtom,
  sidebarOpenAtom,
  editingThemeAtom,
  persistCustomThemes,
  persistCurrentTheme,
  getStoredThemes,
  getStoredCurrentTheme,
  type CustomTheme,
  type CustomThemesMap,
} from "../atoms/themeBuilder";

export const useThemeBuilder = () => {
  // Atom hooks for state management
  const [customThemes, setCustomThemes] = useAtom(customThemesAtom);
  const [currentTheme, setCurrentTheme] = useAtom(currentThemeAtom);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [editingTheme, setEditingTheme] = useAtom(editingThemeAtom);

  // Initialize atoms from localStorage on first render
  useEffect(() => {
    setCustomThemes(getStoredThemes());
    setCurrentTheme(getStoredCurrentTheme());
  }, [setCustomThemes, setCurrentTheme]);

  const createTheme = (theme: CustomTheme) => {
    const updated: CustomThemesMap = {
      ...(customThemes as Record<string, CustomTheme>),
      [theme.name]: theme,
    };
    setCustomThemes(updated);
    persistCustomThemes(updated);
  };

  const updateTheme = (name: string, updates: Partial<CustomTheme>) => {
    const themesRecord = customThemes as Record<string, CustomTheme>;
    const existing = themesRecord[name];
    if (!existing) return;

    const updated: CustomThemesMap = {
      ...themesRecord,
      [name]: {
        ...existing,
        ...updates,
        name: existing.name, // Keep original name
      },
    };
    setCustomThemes(updated);
    persistCustomThemes(updated);
  };

  const deleteTheme = (name: string) => {
    const themesRecord = customThemes as Record<string, CustomTheme>;
    const updated = { ...themesRecord };
    delete updated[name];
    setCustomThemes(updated);
    persistCustomThemes(updated);

    // If deleted theme was selected, switch to default
    if (currentTheme === name) {
      selectTheme("default");
    }
  };

  const selectTheme = (name: string) => {
    setCurrentTheme(name);
    persistCurrentTheme(name);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startEditingTheme = (name: string) => {
    setEditingTheme(name);
  };

  const stopEditingTheme = () => {
    setEditingTheme(null);
  };

  const getTheme = (name: string): CustomTheme | null => {
    const themesRecord = customThemes as Record<string, CustomTheme>;
    return themesRecord[name] || null;
  };

  const allThemeNames: ReadonlyArray<string> = [
    "default",
    "dark",
    "forest",
    "neutral",
    ...Object.keys(customThemes as Record<string, CustomTheme>).sort(),
  ];

  return {
    // State
    customThemes,
    currentTheme,
    sidebarOpen,
    editingTheme,
    allThemeNames,

    // Actions
    createTheme,
    updateTheme,
    deleteTheme,
    selectTheme,
    toggleSidebar,
    startEditingTheme,
    stopEditingTheme,
    getTheme,
  };
};
