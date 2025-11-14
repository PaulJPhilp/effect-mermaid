import { useState, useEffect } from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import type { CustomTheme } from "../atoms/themeBuilder"
import { useThemeBuilder } from "../hooks/useThemeBuilder"
import { ColorInput } from "./ColorInput"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"

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
}

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
  } = useThemeBuilder()

  const [newThemeName, setNewThemeName] = useState("")
  const [showNewThemeForm, setShowNewThemeForm] = useState(false)
  const [editingColors, setEditingColors] = useState<Record<string, string>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (editingTheme) {
      const themesRecord = customThemes as Record<string, CustomTheme>
      const theme = themesRecord[editingTheme]
      if (theme) {
        const colors = { ...DEFAULT_COLORS, ...theme.colors }
        setEditingColors(colors)
      }
    }
  }, [editingTheme, customThemes])

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return

    const theme: CustomTheme = {
      name: newThemeName.trim(),
      colors: DEFAULT_COLORS,
      description: "",
    }

    createTheme(theme)
    setNewThemeName("")
    setShowNewThemeForm(false)
    startEditingTheme(theme.name)
  }

  const handleStartEdit = (themeName: string) => {
    const theme = getTheme(themeName)
    if (theme) {
      const colors = { ...DEFAULT_COLORS, ...theme.colors }
      setEditingColors(colors)
      startEditingTheme(themeName)
    }
  }

  const handleUpdateColor = (colorKey: string, value: string) => {
    setEditingColors((previous) => ({
      ...previous,
      [colorKey]: value,
    }))
  }

  const handleSaveEdit = () => {
    if (!editingTheme) return

    const theme = getTheme(editingTheme)
    if (theme) {
      updateTheme(editingTheme, {
        colors: editingColors,
      })
      stopEditingTheme()
    }
  }

  const handleDeleteTheme = (themeName: string) => {
    deleteTheme(themeName)
    setDeleteConfirm(null)
  }

  const isBuiltIn = (themeName: string) =>
    ["default", "dark", "forest", "neutral"].includes(themeName)

  const isEditing = editingTheme !== null
  const editingThemeObj = editingTheme ? getTheme(editingTheme) : null

  return (
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetContent
        side="left"
        className="w-96 max-w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Theme Builder</SheetTitle>
          <p className="sr-only">
            Create and customize diagram themes with colors and styling options.
          </p>
        </SheetHeader>

        <div className="py-6">
          {!isEditing ? (
            <>
              <div className="mb-8">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Available Themes
                </h4>
                <div className="flex flex-col gap-3">
                  {allThemeNames.map((themeName) => {
                    const isActive = currentTheme === themeName
                    const isBuiltInTheme = isBuiltIn(themeName)
                    const themeObj = isBuiltInTheme ? null : getTheme(themeName)

                    return (
                      <div
                        key={themeName}
                        className={`rounded-lg border border-border bg-muted/50 p-3 transition-colors ${
                          isActive
                            ? "border-primary bg-accent/60 shadow-sm"
                            : "hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className="flex flex-1 items-center gap-2 rounded-md px-2 py-1 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"
                            onClick={() => selectTheme(themeName)}
                            title={`Switch to ${themeName}`}
                          >
                            <span className="truncate">{themeName}</span>
                            {isBuiltInTheme && (
                              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                                Built-in
                              </span>
                            )}
                          </button>
                          {!isBuiltInTheme && (
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStartEdit(themeName)}
                                title="Edit theme"
                                aria-label={`Edit ${themeName}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(themeName)}
                                title="Delete theme"
                                aria-label={`Delete ${themeName}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {themeObj?.description && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {themeObj.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {!showNewThemeForm ? (
                <Button
                  type="button"
                  onClick={() => setShowNewThemeForm(true)}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Theme</span>
                </Button>
              ) : (
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/60 p-4">
                  <Input
                    type="text"
                    placeholder="Theme name"
                    value={newThemeName}
                    onChange={(event) => setNewThemeName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleCreateTheme()
                      if (event.key === "Escape") {
                        setShowNewThemeForm(false)
                        setNewThemeName("")
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleCreateTheme}
                      disabled={!newThemeName.trim()}
                      className="flex-1"
                      size="sm"
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowNewThemeForm(false)
                        setNewThemeName("")
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

              {deleteConfirm && (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                  <p className="mb-4 text-sm font-medium text-destructive">
                    Delete &quot;{deleteConfirm}&quot;?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleDeleteTheme(deleteConfirm)}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
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
            editingThemeObj && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-foreground">
                    Editing: {editingTheme}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={stopEditingTheme}
                    title="Close editor"
                    aria-label="Close theme editor"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="theme-description">
                    Description (optional)
                  </Label>
                  <Input
                    id="theme-description"
                    type="text"
                    value={editingThemeObj.description || ""}
                    onChange={(event) => {
                      updateTheme(editingTheme, {
                        description: event.target.value,
                      })
                    }}
                    placeholder="Theme description"
                  />
                </div>

                <div>
                  <h5 className="mb-4 text-sm font-semibold text-foreground">
                    Colors
                  </h5>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(editingColors).map(([key, value]) => (
                      <ColorInput
                        key={key}
                        label={key}
                        value={value}
                        onChange={(color) => {
                          handleUpdateColor(key, color)
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
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
  )
}
