# @effect-mermaid-react

React components for effect-mermaid diagram rendering in browsers.

## Installation

```bash
pnpm add @effect-mermaid-react
```

## Usage

```tsx
import React from "react";
import { MermaidDiagram, MermaidProvider } from "@effect-mermaid-react";

function App() {
  return (
    <MermaidProvider>
      <MermaidDiagram
        diagram={`graph TD
          A[Start] --> B{Decision}
          B -->|Yes| C[Action]
          B -->|No| D[End]`}
        config={{ theme: "dark" }}
      />
    </MermaidProvider>
  );
}
```

## Components

### MermaidProvider
Context provider that initializes Mermaid.js in the browser.

### MermaidDiagram
Component that renders a Mermaid diagram with automatic re-rendering on changes.
