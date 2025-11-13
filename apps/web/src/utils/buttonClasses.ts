/**
 * Reusable button className utilities for consistent button styling
 * across the application without relying on CSS classes
 */

export const buttonClasses = {
  // Small toolbar button - used for editor toolbar, theme buttons
  small:
    'px-3 py-1.5 text-xs h-7 flex items-center whitespace-nowrap border border-border bg-background text-foreground rounded cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-muted hover:border-primary hover:text-primary',

  // Small toolbar button (active state) - for theme selection
  smallActive:
    'px-3 py-1.5 text-xs h-7 flex items-center whitespace-nowrap border border-border bg-primary text-primary-foreground rounded cursor-pointer text-sm font-medium transition-all duration-200 border-primary',

  // Icon button for sidebar actions (edit, delete)
  icon: 'bg-none border-none text-base cursor-pointer p-1 rounded transition-all duration-200 hover:bg-black/10',
  iconDelete: 'bg-none border-none text-base cursor-pointer p-1 rounded transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900',

  // Close button (X icon)
  close:
    'bg-none border-none text-2xl cursor-pointer text-foreground p-0 w-8 h-8 flex items-center justify-center rounded transition-all duration-200 hover:bg-muted hover:text-foreground',
};

/**
 * Utility function to combine button classes with additional custom classes
 */
export const combineButtonClasses = (
  baseClass: keyof typeof buttonClasses,
  additionalClasses?: string
): string => {
  const base = buttonClasses[baseClass];
  return additionalClasses ? `${base} ${additionalClasses}` : base;
};
