/**
 * Curated Mermaid diagram examples for the diagram studio
 * These examples showcase different diagram types and common patterns
 */

export interface DiagramExample {
  name: string
  description: string
  category: "flowchart" | "sequence" | "class" | "state" | "gantt" | "other"
  code: string
}

export const DIAGRAM_EXAMPLES: DiagramExample[] = [
  {
    name: "Basic Flowchart",
    description: "Simple decision flow",
    category: "flowchart",
    code: `graph LR
    A[Start] --> B{Condition}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  },
  {
    name: "Complex Workflow",
    description: "Multi-step process with loops",
    category: "flowchart",
    code: `graph TD
    Start([Start]) --> Input[Input Data]
    Input --> Validate{Validate?}
    Validate -->|Invalid| Error[Show Error]
    Error --> Input
    Validate -->|Valid| Process[Process Data]
    Process --> Save[Save Results]
    Save --> Notify[Send Notification]
    Notify --> End([End])`,
  },
  {
    name: "Sequence Diagram",
    description: "Interaction between components",
    category: "sequence",
    code: `sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Submit Form
    Frontend->>API: POST /data
    API->>Database: Save Record
    Database-->>API: Success
    API-->>Frontend: 200 OK
    Frontend-->>User: Show Success`,
  },
  {
    name: "Class Diagram",
    description: "Object-oriented relationships",
    category: "class",
    code: `classDiagram
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    class Fish {
        -int sizeInFeet
        -canEat()
    }
    class Zebra {
        +bool is_wild
        +run()
    }
    
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra`,
  },
  {
    name: "State Diagram",
    description: "State machine transitions",
    category: "state",
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Error --> Idle: Retry
    Success --> [*]`,
  },
  {
    name: "Gantt Chart",
    description: "Project timeline",
    category: "gantt",
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Design           :a1, 2024-01-01, 30d
    section Phase 2
    Development      :a2, after a1, 45d
    Testing          :a3, after a2, 15d
    section Phase 3
    Deployment       :a4, after a3, 10d`,
  },
  {
    name: "Git Flow",
    description: "Git branching strategy",
    category: "flowchart",
    code: `graph TD
    A[main] --> B[develop]
    B --> C[feature/xyz]
    B --> D[release/v1.0]
    C --> B
    D --> A
    D --> B
    A --> E[hotfix/bug]
    E --> A
    E --> B`,
  },
  {
    name: "Component Architecture",
    description: "System component relationships",
    category: "flowchart",
    code: `graph TB
    subgraph Frontend
        UI[UI Components]
        State[State Management]
    end
    subgraph Backend
        API[API Server]
        DB[(Database)]
    end
    UI --> State
    State --> API
    API --> DB`,
  },
]

/**
 * Get examples by category
 */
export function getExamplesByCategory(
  category: DiagramExample["category"],
): DiagramExample[] {
  return DIAGRAM_EXAMPLES.filter((ex) => ex.category === category)
}

/**
 * Get example by name
 */
export function getExampleByName(name: string): DiagramExample | undefined {
  return DIAGRAM_EXAMPLES.find((ex) => ex.name === name)
}

