# Web Testing

DiracX Web uses a layered testing approach to ensure reliability at different levels of the application.

## Testing layers

### Component tests (Jest + React Testing Library)

Unit and integration tests for individual React components. These tests run in a simulated DOM environment (jsdom) and verify that components render correctly, handle user interactions, and manage state properly.

```bash
npm run test:diracx-web-components
```

Tests live alongside their components in `packages/diracx-web-components/test/`.

**When to use**: Testing component rendering, props handling, user interactions, hooks, and context behavior.

### End-to-end tests (Cypress)

Full application tests that run in a real browser against a running DiracX backend. These tests simulate real user workflows including authentication, navigation, and data operations.

```bash
export DIRACX_URL=<diracx-backend-url>
npm run --prefix packages/diracx-web test
```

Tests live in `packages/diracx-web/cypress/`.

**When to use**: Testing complete user flows, authentication, API integration, and cross-component interactions.

### Visual documentation (Storybook)

While not a testing tool per se, [Storybook](https://storybook.js.org/) serves as a visual verification layer. Each component story acts as a living example that can be visually inspected and interacted with.

```bash
npm run doc:diracx-web-components
```

Stories live in `packages/diracx-web-components/stories/`.

**When to use**: Documenting component variations, verifying visual appearance, and enabling manual exploratory testing.

## What to test at each level

| Level | Scope | Speed | Examples |
|-------|-------|-------|----------|
| Component (Jest) | Single component or hook | Fast | Button renders correctly, form validates input |
| E2E (Cypress) | Full user workflow | Slow | User logs in, submits a job, views results |
| Visual (Storybook) | Component appearance | Manual | Theme variations, responsive layouts |

## Guidelines

- Write component tests for all new components and hooks
- Add Storybook stories for reusable UI components
- Add E2E tests for critical user workflows
- Use [Jest coverage reports](https://jestjs.io/docs/code-coverage) to identify untested code
