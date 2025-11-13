/**
 * Example usage of ShadCn UI components
 * This file demonstrates how to use the newly installed components
 * 
 * To use these components in your app:
 * 1. Import from @/components/ui
 * 2. Use them as shown in the examples below
 * 3. Customize with variants and props
 */

import { Button } from "./button"
import { Input } from "./input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"
import { cn } from "@/lib/utils"

/**
 * Example 1: Button Component
 * Shows all available variants and sizes
 */
export function ButtonExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Button Variants</h2>
      
      {/* Variants */}
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      {/* Sizes */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">→</Button>
      </div>

      {/* States */}
      <div className="flex flex-wrap gap-2">
        <Button disabled>Disabled</Button>
        <Button onClick={() => alert("Clicked!")}>Click me</Button>
      </div>
    </div>
  )
}

/**
 * Example 2: Input Component
 * Text and other input types
 */
export function InputExamples() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Input Variants</h2>
      
      <div className="space-y-2">
        <Input type="text" placeholder="Text input..." />
        <Input type="email" placeholder="Email input..." />
        <Input type="password" placeholder="Password input..." />
        <Input type="number" placeholder="Number input..." />
        <Input type="file" />
        <Input type="text" disabled placeholder="Disabled input..." />
      </div>
    </div>
  )
}

/**
 * Example 3: Dialog Component
 * Modal dialog with header, content, and footer
 */
export function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {/* Dialog content */}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Enter your name..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="Enter your email..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Example 4: Using the cn() utility for conditional styles
 * Demonstrates how to merge classnames properly with Tailwind
 */
export function ConditionalStylesExample() {
  const isActive = true
  const isLarge = false

  return (
    <div
      className={cn(
        "p-4 rounded-md border",
        isActive && "bg-blue-100 border-blue-500",
        !isActive && "bg-gray-100 border-gray-500",
        isLarge && "p-8 text-lg",
      )}
    >
      This div has conditional styles applied with cn()
    </div>
  )
}

/**
 * Example 5: Complete Form Component
 * Shows how to compose multiple UI components together
 */
export function FormExample() {
  return (
    <div className="w-full max-w-md space-y-4 rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold">Login Form</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <Input type="email" placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Password</label>
        <Input type="password" placeholder="••••••••" />
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">Sign In</Button>
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

/**
 * To use these examples in your app:
 * 
 * import { ButtonExamples, InputExamples, DialogExample } from "@/components/ui/examples"
 * 
 * function App() {
 *   return (
 *     <div className="p-8 space-y-8">
 *       <ButtonExamples />
 *       <InputExamples />
 *       <DialogExample />
 *     </div>
 *   )
 * }
 */
