# Web Coding Conventions

This reference documents the coding conventions used in the DiracX Web codebase.

## TypeScript

- Use TypeScript for all source files
- Define explicit types for component props and function parameters
- Avoid `any` — use `unknown` or proper types instead
- Export types from `types/` directories and re-export from `index.ts`

## React / Next.js patterns

### App Router

DiracX Web uses the [Next.js App Router](https://nextjs.org/docs/app). Pages are defined in `src/app/` with folder-based routing:

- `page.tsx` — Page component for a route
- `layout.tsx` — Shared layout wrapping child routes
- Route groups (parenthesized folders like `(dashboard)`) organize routes without affecting the URL

### Contexts and hooks

- Use React Context for shared state (authentication, theme, application list)
- Create custom hooks in `hooks/` for reusable logic
- Wrap providers in layout files to scope state to route segments

### Components

- Keep components small and focused on a single responsibility
- Use MUI components as building blocks
- Place reusable components in `diracx-web-components`, app-specific ones in the app package

## Material UI (MUI)

- Use MUI's `sx` prop or `styled` API for styling — avoid raw CSS
- Follow the MUI theme for colors, spacing, and typography
- Use MUI icons from `@mui/icons-material`

## File and directory naming

- Use **camelCase** for component files and directories (e.g., `JobMonitor/`, `testApp.tsx`)
- Use **kebab-case** for documentation files (e.g., `web-coding-conventions.md`)
- Group related components in subdirectories

## Component library exports

When adding a component, hook, or type to `diracx-web-components`:

1. Create the implementation in the appropriate directory
2. Add the export to the relevant `index.ts` file
3. Run `npm run build` inside `packages/diracx-web-components` to ensure the build succeeds

This is required because the pre-commit hook (`Husky`) validates that the library builds cleanly.

## Linting and formatting

- [ESLint](https://eslint.org/) enforces code quality rules
- [Prettier](https://prettier.io/) handles formatting
- Run `npm run lint` to check all packages
- Run `npm run ts-lint` for TypeScript type checking
