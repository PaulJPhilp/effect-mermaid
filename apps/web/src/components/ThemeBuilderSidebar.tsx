import { useState, useEffect } from "react";
import { useThemeBuilder } from "../hooks/useThemeBuilder";
import { ColorInput } from "./ColorInput";
import "../styles/ThemeBuilderSidebar.css";
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
    <>
      {/* Toggle button */}
      <button
        className="theme-builder-toggle"
        onClick={toggleSidebar}
        title={sidebarOpen ? "Close theme builder" : "Open theme builder"}
        aria-label="Theme builder"
      >
        🎨
      </button>

      {/* Sidebar */}
      <div className={`theme-builder-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Theme Builder</h3>
          <button
            className="close-button"
            onClick={toggleSidebar}
            title="Close"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          {!isEditing ? (
            <>
              {/* Theme list */}
              <div className="theme-list-section">
                <h4>Available Themes</h4>
                <div className="theme-list">
                  {allThemeNames.map((themeName) => {
                    const isActive = currentTheme === themeName;
                    const isBuiltInTheme = isBuiltIn(themeName);
                    const themeObj = isBuiltInTheme ? null : getTheme(themeName);

                    return (
                      <div
                        key={themeName}
                        className={`theme-item ${isActive ? "active" : ""}`}
                      >
                        <div className="theme-item-header">
                          <button
                            className="theme-name-button"
                            onClick={() => selectTheme(themeName)}
                            title={`Switch to ${themeName}`}
                          >
                            {themeName}
                            {isBuiltInTheme && <span className="badge">Built-in</span>}
                          </button>
                          {!isBuiltInTheme && (
                            <div className="theme-item-actions">
                              <button
                                className="icon-button"
                                onClick={() => handleStartEdit(themeName)}
                                title="Edit theme"
                                aria-label={`Edit ${themeName}`}
                              >
                                ✏️
                              </button>
                              <button
                                className="icon-button delete"
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
                          <p className="theme-description">{themeObj.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* New theme button */}
              {!showNewThemeForm ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowNewThemeForm(true)}
                >
                  + New Theme
                </button>
              ) : (
                <div className="new-theme-form">
                  <input
                    type="text"
                    placeholder="Theme name"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    className="theme-name-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTheme();
                      if (e.key === "Escape") {
                        setShowNewThemeForm(false);
                        setNewThemeName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="form-actions">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={handleCreateTheme}
                      disabled={!newThemeName.trim()}
                    >
                      Create
                    </button>
                    <button
                      className="btn btn-small"
                      onClick={() => {
                        setShowNewThemeForm(false);
                        setNewThemeName("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirmation */}
              {deleteConfirm && (
                <div className="delete-confirmation">
                  <p>Delete "{deleteConfirm}"?</p>
                  <div className="form-actions">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteTheme(deleteConfirm)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-small"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Edit form */
            editingThemeObj && (
              <div className="edit-form">
                <div className="edit-header">
                  <h4>Editing: {editingTheme}</h4>
                  <button
                    className="close-button"
                    onClick={stopEditingTheme}
                    title="Close editor"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="edit-description">
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    value={editingThemeObj.description || ""}
                    onChange={(e) => {
                      updateTheme(editingTheme, {
                        description: e.target.value,
                      });
                    }}
                    placeholder="Theme description"
                    className="description-input"
                  />
                </div>

                <div className="colors-section">
                  <h5>Colors</h5>
                  <div className="color-inputs-grid">
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

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className="btn" onClick={stopEditingTheme}>
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
    </>
  );
};
