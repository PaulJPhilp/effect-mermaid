# Project Overview

This is a monorepo for `effect-mermaid`, a library for rendering Mermaid diagrams using the Effect-TS ecosystem. It provides packages for core functionality (`@effect-mermaid`), Node.js (`@effect-mermaid-node`), and React (`@effect-mermaid-react`). The project is written in TypeScript.

The monorepo is managed with pnpm workspaces.

## Building and Running

### Build

To build all packages, run:

```bash
pnpm build
```

To build a specific package:

```bash
pnpm --filter <package-name> build
```

### Testing

To run all tests:

```bash
pnpm test
```

To run tests for a specific package:

```bash
pnpm --filter <package-name> test
```

To run tests with coverage:

```bash
pnpm test:ci
```

### Type Checking

To type-check all packages:

```bash
pnpm check
```

### Development

To start the development server for the web app:

```bash
pnpm dev
```

## Development Conventions

*   **Package Manager:** This project uses `pnpm`.
*   **Monorepo:** The project is a monorepo with packages located in the `packages` directory.
*   **Testing:** Tests are written with `vitest`.
*   **Versioning:** This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.
