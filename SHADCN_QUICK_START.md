# ShadCn Migration Quick Start

## Phase 1: Install Components

```bash
cd apps/web

# Core components
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add input
bunx shadcn-ui@latest add label
bunx shadcn-ui@latest add select
bunx shadcn-ui@latest add slider
bunx shadcn-ui@latest add sheet
bunx shadcn-ui@latest add accordion
bunx shadcn-ui@latest add alert
bunx shadcn-ui@latest add form
bunx shadcn-ui@latest add separator
```

---

## Component Migration Examples

### 1. Button Component

**BEFORE:**
```jsx
<button className="btn btn-small" onClick={handleClick}>
  Copy
</button>
```

**AFTER:**
```jsx
import { Button } from "@/components/ui/button"

<Button size="sm" onClick={handleClick}>
  Copy
</Button>
```

---

### 2. ColorPicker Control

**BEFORE:**
```jsx
const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="color-picker-container">
    <label className="color-label">{label}</label>
    <div className="color-picker-wrapper">
      <input type="color" value={value} onChange={handleColorChange} />
      <input type="text" value={inputValue} onChange={handleTextChange} />
    </div>
  </div>
)
```

**AFTER:**
```jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label htmlFor={`color-${label}`}>{label}</Label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value}
        onChange={handleColorChange}
        className="h-10 w-14 cursor-pointer rounded border border-input"
        id={`color-${label}`}
      />
      <Input
        type="text"
        value={inputValue}
        onChange={handleTextChange}
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  </div>
)
```

---

### 3. NumberSlider Control

**BEFORE:**
```jsx
const NumberSlider: React.FC<NumberSliderProps> = ({ label, value, min, max, onChange }) => (
  <div className="slider-container">
    <label>{label}</label>
    <input type="range" min={min} max={max} value={value} onChange={handleChange} />
  </div>
)
```

**AFTER:**
```jsx
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const NumberSlider: React.FC<NumberSliderProps> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-3">
    <Label>{label}</Label>
    <Slider
      min={min}
      max={max}
      step={1}
      value={[value]}
      onValueChange={(vals) => onChange(vals[0])}
      className="w-full"
    />
  </div>
)
```

---

### 4. Select Control

**BEFORE:**
```jsx
const FontSizeSelect = ({ value, onChange }) => (
  <div className="select-container">
    <label>Font Size</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
)
```

**AFTER:**
```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const FontSizeSelect = ({ value, onChange }) => (
  <div className="space-y-2">
    <Label>Font Size</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select size" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map(opt => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)
```

---

### 5. Sidebar Panel

**BEFORE:**
```jsx
<div className="rendering-settings-panel">
  <div className="panel-header">
    <h3>Rendering Settings</h3>
    <button className="close-button" onClick={() => setShowSettingsPanel(false)}>✕</button>
  </div>
  {/* Content */}
</div>
```

**AFTER:**
```jsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

<Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" title="Rendering Settings">
      ⚙️
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-96">
    <SheetHeader>
      <SheetTitle>Rendering Settings</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

---

### 6. Collapsible Sections

**BEFORE:**
```jsx
const [expandedSections, setExpandedSections] = useState({ nodes: true, edges: true })

const toggleSection = (section) => {
  setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
}

return (
  <div>
    {expandedSections.nodes && <div>Nodes Settings</div>}
  </div>
)
```

**AFTER:**
```jsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

<Accordion type="multiple" defaultValue={["nodes", "edges"]}>
  <AccordionItem value="nodes">
    <AccordionTrigger>Nodes</AccordionTrigger>
    <AccordionContent>
      {/* Nodes Settings */}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="edges">
    <AccordionTrigger>Edges</AccordionTrigger>
    <AccordionContent>
      {/* Edges Settings */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### 7. Error Display

**BEFORE:**
```jsx
{diagramError && (
  <div style={{ padding: "1rem", backgroundColor: "#ffebee", border: "1px solid #ef5350" }}>
    <div style={{ fontWeight: "bold" }}>❌ Diagram Error</div>
    <div>{diagramError.message}</div>
  </div>
)}
```

**AFTER:**
```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

{diagramError && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Diagram Error</AlertTitle>
    <AlertDescription>{diagramError.message}</AlertDescription>
  </Alert>
)}
```

---

## Utility Classes Reference

### Spacing
```
p-4    = padding: 1rem
m-2    = margin: 0.5rem
gap-2  = gap: 0.5rem
space-y-2 = margin-bottom: 0.5rem (children)
```

### Flexbox
```
flex           = display: flex
flex-col       = flex-direction: column
items-center   = align-items: center
justify-between = justify-content: space-between
gap-2          = gap: 0.5rem
```

### Colors
```
bg-primary     = background-color: var(--primary)
text-foreground = color: var(--foreground)
border-border  = border-color: var(--border)
```

### Other
```
rounded        = border-radius: 0.375rem
cursor-pointer = cursor: pointer
transition-all = all transitions
duration-300   = transition duration: 300ms
```

---

## Form Hook Usage

For complex forms, use React Hook Form with ShadCn Form:

```jsx
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const form = useForm({ defaultValues: { name: "" } })

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
)
```

---

## Common Patterns

### Disabled State
```jsx
<Button disabled>Disabled</Button>
<Input disabled />
```

### Loading State
```jsx
<Button disabled>
  <Loader className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Icon + Text Button
```jsx
import { Copy } from "lucide-react"

<Button>
  <Copy className="mr-2 h-4 w-4" />
  Copy
</Button>
```

### Responsive Classes
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>
```

---

## Testing Updates

### Before (Custom components)
```jsx
const { getByRole } = render(<ColorPicker label="Test" value="#000" onChange={jest.fn()} />)
const input = getByRole("textbox")
```

### After (ShadCn components)
```jsx
import { render, screen } from "@testing-library/react"

const { getByDisplayValue } = render(<ColorPicker label="Test" value="#000" onChange={jest.fn()} />)
const input = getByDisplayValue("#000")
```

---

## Debugging Tips

1. **Check Tailwind Classes** - Use browser DevTools to inspect computed styles
2. **Console Warnings** - Check for missing dependencies or component props
3. **Dark Mode** - Add `dark` class to `<html>` element to test
4. **Accessibility** - Use axe DevTools extension to audit components
5. **Animation** - Check browser DevTools for animation performance

---

## Helpful Resources

- ShadCn/UI Docs: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI (underlying primitives): https://www.radix-ui.com
- Lucide Icons: https://lucide.dev
- React Hook Form: https://react-hook-form.com
