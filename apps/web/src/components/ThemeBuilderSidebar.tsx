import { useState, useEffect } from "react";
import { useThemeBuilder } from "../hooks/useThemeBuilder";
import { ColorInput } from "./ColorInput";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { buttonClasses } from "../utils/buttonClasses";
import type { CustomTheme } from "../atoms/themeBuilder";

const DEFAULT_COLORS = {
  background: "#ffffff",
  primaryColor: "#000000",
  secondaryColor: "#cccccc",
  primaryTextColor: "#000000",
  secondaryTextColor: "#333333",
  tertiaryTextColor: "#666666",
  primaryBorderColor: "#000000",
  secondaryBorderColor: "#333333",
  tertiaryBorderColor: "#999999",
  lineColor: "#333333",
  textColor: "#000000",
};

export const ThemeBuilderSidebar = () => {
  const {
    customThemes,
    currentTheme,
    sidebarOpen,
    editingTheme,
    allThemeNames,
    createTheme,
    updateTheme,
    deleteTheme,
    selectTheme,
    toggleSidebar,
    startEditingTheme,
    stopEditingTheme,
    getTheme,
  } = useThemeBuilder();

  const [newThemeName, setNewThemeName] = useState("");
  const [showNewThemeForm, setShowNewThemeForm] = useState(false);
  const [editingColors, setEditingColors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sync editingColors when editingTheme changes
  useEffect(() => {
    if (editingTheme) {
      const themesRecord = customThemes as Record<string, CustomTheme>;
      const theme = themesRecord[editingTheme];
      if (theme) {
        // Merge theme colors with DEFAULT_COLORS to ensure all color fields are present
        const colors = { ...DEFAULT_COLORS, ...theme.colors };
        setEditingColors(colors);
      }
    }
  }, [editingTheme, customThemes]);

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return;

    const theme: CustomTheme = {
      name: newThemeName.trim(),
      colors: DEFAULT_COLORS,
      description: "",
    };

    createTheme(theme);
    setNewThemeName("");
    setShowNewThemeForm(false);
    startEditingTheme(theme.name);
  };

  const handleStartEdit = (themeName: string) => {
    const theme = getTheme(themeName);
    if (theme) {
      // Merge theme colors with DEFAULT_COLORS to ensure all color fields are present
      const colors = { ...DEFAULT_COLORS, ...theme.colors };
      setEditingColors(colors);
      startEditingTheme(themeName);
    }
  };

  const handleUpdateColor = (colorKey: string, value: string) => {
    setEditingColors({
      ...editingColors,
      [colorKey]: value,
    });
  };

  const handleSaveEdit = () => {
    if (!editingTheme) return;

    const theme = getTheme(editingTheme);
    if (theme) {
      updateTheme(editingTheme, {
        colors: editingColors,
      });
      stopEditingTheme();
    }
  };

  const handleDeleteTheme = (themeName: string) => {
    deleteTheme(themeName);
    setDeleteConfirm(null);
  };

  const isBuiltIn = (themeName: string) =>
    ["default", "dark", "forest", "neutral"].includes(themeName);

  const isEditing = editingTheme !== null;
  const editingThemeObj = editingTheme ? getTheme(editingTheme) : null;

  return (
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetTrigger asChild>
        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-white border-none text-2xl cursor-pointer transition-all duration-300 z-50 flex items-center justify-center hover:scale-110 active:scale-95"
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
          title={sidebarOpen ? "Close theme builder" : "Open theme builder"}
          aria-label="Theme builder"
        >
          🎨
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Theme Builder</SheetTitle>
          <p className="hidden">Create and customize diagram themes with colors and styling options.</p>
        </SheetHeader>

        <div className="py-6">
          {!isEditing ? (
            <>
              {/* Theme list */}
              <div className="mb-8">
                <h4 className="m-0 mb-4 text-sm text-muted-foreground uppercase font-semibold tracking-wider">
                  Available Themes
                </h4>
                <div className="flex flex-col gap-3">
                  {allThemeNames.map((themeName) => {
                    const isActive = currentTheme === themeName;
                    const isBuiltInTheme = isBuiltIn(themeName);
                    const themeObj = isBuiltInTheme ? null : getTheme(themeName);

                    return (
                      <div
                        key={themeName}
                        className={`px-3 py-3 border border-border rounded-lg bg-muted transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950 border-indigo-500 shadow-sm"
                            : "hover:bg-muted hover:border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            className="flex-1 bg-none border-none p-2 text-left cursor-pointer text-foreground font-medium text-sm flex items-center gap-2 hover:text-indigo-500 transition-colors"
                            onClick={() => selectTheme(themeName)}
                            title={`Switch to ${themeName}`}
                          >
                            {themeName}
                            {isBuiltInTheme && (
                              <span className="inline-block px-2 py-1 bg-indigo-500 text-white text-xs font-semibold rounded uppercase">
                                Built-in
                              </span>
                            )}
                          </button>
                          {!isBuiltInTheme && (
                            <div className="flex gap-1">
                              <button
                                className={buttonClasses.icon}
                                onClick={() => handleStartEdit(themeName)}
                                title="Edit theme"
                                aria-label={`Edit ${themeName}`}
                              >
                                ✏️
                              </button>
                              <button
                                className={buttonClasses.iconDelete}
                                onClick={() => setDeleteConfirm(themeName)}
                                title="Delete theme"
                                aria-label={`Delete ${themeName}`}
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                        {themeObj?.description && (
                          <p className="mt-2 mb-0 text-xs text-muted-foreground">
                            {themeObj.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* New theme button */}
              {!showNewThemeForm ? (
                <Button
                  onClick={() => setShowNewThemeForm(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  + New Theme
                </Button>
              ) : (
                <div className="flex flex-col gap-4 p-4 bg-muted border border-border rounded-lg">
                  <Input
                    type="text"
                    placeholder="Theme name"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTheme();
                      if (e.key === "Escape") {
                        setShowNewThemeForm(false);
                        setNewThemeName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateTheme}
                      disabled={!newThemeName.trim()}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                      size="sm"
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewThemeForm(false);
                        setNewThemeName("");
                      }}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete confirmation */}
              {deleteConfirm && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mt-4">
                  <p className="m-0 mb-4 text-destructive font-medium">
                    Delete "{deleteConfirm}"?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDeleteTheme(deleteConfirm)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => setDeleteConfirm(null)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Edit form */
            editingThemeObj && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="m-0 text-foreground font-semibold text-base">
                    Editing: {editingTheme}
                  </h4>
                  <button
                    className={buttonClasses.close}
                    onClick={stopEditingTheme}
                    title="Close editor"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="theme-description">
                    Description (optional)
                  </Label>
                  <Input
                    id="theme-description"
                    type="text"
                    value={editingThemeObj.description || ""}
                    onChange={(e) => {
                      updateTheme(editingTheme, {
                        description: e.target.value,
                      });
                    }}
                    placeholder="Theme description"
                  />
                </div>

                <div>
                  <h5 className="m-0 mb-4 text-foreground font-semibold text-sm">
                    Colors
                  </h5>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {Object.entries(editingColors).map(([key, value]) => (
                      <ColorInput
                        key={key}
                        label={key}
                        value={value}
                        onChange={(color) => {
                          handleUpdateColor(key, color);
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={stopEditingTheme}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
