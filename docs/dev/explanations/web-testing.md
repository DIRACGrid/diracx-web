# Web Testing

DiracX Web uses a layered testing strategy where each layer builds on the previous one:

1. **Storybook** illustrates shared and public components that extensions can import
2. **Jest tests** verify that those stories render correctly and stay up to date
3. **E2E tests** ensure essential user interactions work end-to-end

## Testing layers

### Storybook (visual documentation and component showcase)

[Storybook](https://storybook.js.org/) is the foundation of the testing strategy. Each shared or public component that extensions can import should have a corresponding story. Stories serve as living documentation, showing how components look and behave with different props, states, and edge cases.

```bash
npm run doc:diracx-web-components
```

Stories live in `packages/diracx-web-components/stories/`.

**What to document**: All reusable components exported by `diracx-web-components` — default states, loading/error/empty states, and key variations.

### Component tests (Jest + React Testing Library)

Jest tests import and render the Storybook stories using `composeStories()` from `@storybook/react`. This ensures that the stories themselves are valid and that the components they illustrate work correctly. If a story breaks, the corresponding Jest test will catch it.

```bash
npm run test:diracx-web-components
```

Tests live in `packages/diracx-web-components/test/`.

**What to test**: That stories render without errors, that key elements are present in the DOM, and that basic interactions (clicks, form inputs) produce the expected results.

### End-to-end tests (Cypress)

E2E tests run in a real browser against a running DiracX backend. They verify that essential user workflows work correctly across the full stack — authentication, navigation, data display, and user actions.

```bash
export DIRACX_URL=<diracx-backend-url>
npm run --prefix packages/diracx-web test
```

Tests live in `packages/diracx-web/test/e2e/`.

**What to test**: Critical user flows such as logging in, filtering and sorting data, performing actions on jobs, and verifying that interactive features (e.g., clicking a pie chart slice updates the search bar and table) work end-to-end.

## How the layers connect

| Layer | Purpose | Speed | Depends on |
|-------|---------|-------|------------|
| Storybook | Document components for extension developers | Manual | Mocks only |
| Jest | Verify stories render and behave correctly | Fast | Storybook stories |
| Cypress | Verify essential user workflows | Slow | Running backend |

## Guidelines

- Add Storybook stories for all shared/public components exported by `diracx-web-components`
- Write Jest tests that render the stories via `composeStories()` to keep stories and tests in sync
- Add E2E tests for critical user workflows and cross-component interactions
- Use [Jest coverage reports](https://jestjs.io/docs/code-coverage) to identify untested code
