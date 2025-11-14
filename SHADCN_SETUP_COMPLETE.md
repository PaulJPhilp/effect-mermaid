# ShadCn Setup - High Priority Tasks Complete

## ✅ Completed

### 1. Created `postcss.config.js`
- **Location**: `apps/web/postcss.config.js`
- **Purpose**: Enables PostCSS processing for Tailwind CSS v4
- **Contents**: Configured with tailwindcss and autoprefixer plugins

### 2. Created `src/lib/utils.ts`
- **Location**: `apps/web/src/lib/utils.ts`
- **Purpose**: Provides the `cn()` utility function for merging classnames
- **Usage**: `import { cn } from "@/lib/utils"` in components
- **Implementation**: Combines `clsx` and `tailwind-merge` for proper class merging

### 3. Installed ShadCn UI Components
- **Button** - `apps/web/src/components/ui/button.tsx`
  - Variants: default, destructive, outline, secondary, ghost, link
  - Sizes: default, sm, lg, icon
  - Built with CVA for type-safe variants
  
- **Input** - `apps/web/src/components/ui/input.tsx`
  - Styled form input with Tailwind CSS
  - Support for file uploads
  - Focus and disabled states
  
- **Dialog** - `apps/web/src/components/ui/dialog.tsx`
  - Built on Radix UI's Dialog primitive
  - Includes: Overlay, Content, Header, Footer, Title, Description
  - Animated transitions included
  
- **Index Export** - `apps/web/src/components/ui/index.ts`
  - Convenience exports for all UI components

### 4. Updated Configuration Files

#### `apps/web/components.json`
- Fixed icon library from `lucide` to `lucide-react`
- Updated aliases to use `@/` prefix (e.g., `@/components`, `@/ui`)
- Removed deprecated `registries` field

#### `apps/web/vite.config.ts`
- Added `@` alias pointing to `./src`
- Updated dev server port from 3000 to 5173 (consistent with AGENTS.md)
- Changed `open: true` to `open: false`
- Added `strictPort: true` to fail if port is unavailable

### 5. Added Missing Dependency
- Installed `@radix-ui/react-slot` (required by Button component)

## 📦 Dependencies Now Available

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.462.0"
  }
}
```

## 🚀 Quick Start - Using Components

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function Example() {
  return (
    <>
      <Button onClick={() => console.log("clicked")}>Click me</Button>
      
      <Input type="text" placeholder="Enter text..." />
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description goes here</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

## 🎨 Available Button Variants

```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

## 🔄 Path Aliases Available

| Alias | Path |
|-------|------|
| `@/components` | `./src/components` |
| `@/ui` | `./src/components/ui` |
| `@/lib` | `./src/lib` |
| `@/utils` | `./src/lib/utils` |
| `@/hooks` | `./src/hooks` |

## ✅ Type Checking Passes

All packages pass TypeScript type checking:
- `effect-mermaid`
- `effect-mermaid-node`
- `effect-mermaid-react`

## 📝 Next Steps

### Medium Priority
- [ ] Fix port in vite.config (changed to 5173, but verify other configs)
- [ ] Consolidate color systems (custom variables vs ShadCn defaults)
- [ ] Add dark mode toggle provider
- [ ] Create additional components as needed (Select, Dropdown, etc.)

### Testing
- [ ] Test components in dev environment: `bun run dev`
- [ ] Verify imports resolve correctly with `@/` aliases
- [ ] Check CSS variable theming works

### Components to Add Later
```bash
# Common UI components
bunx shadcn@latest add select
bunx shadcn@latest add dropdown-menu
bunx shadcn@latest add form
bunx shadcn@latest add toast
bunx shadcn@latest add tabs
```

## 🐛 Known Issues

- The new `shadcn@latest` CLI has compatibility issues with Tailwind v4
- Components were installed manually instead of via CLI
- This is temporary—ShadCn CLI will be updated to support Tailwind v4 fully

## 📚 Resources

- ShadCn Documentation: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- CVA (Class Variance Authority): https://cva.style/
- Tailwind CSS v4: https://tailwindcss.com/
