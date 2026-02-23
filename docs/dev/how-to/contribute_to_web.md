# Contributing to DiracX-Web

*Requirements: [Setup Environment](setup_web_environment.md)*

=== "Documentation"

    Ensure that any code you write is well-documented. This includes:

    - Inline comments where necessary to explain complex logic.
    - Updating or creating Storybook documentation if you are contributing to the `diracx-web-components` library.
    - You can use tools like [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to maintain code quality.

=== "Testing"

    **Component Testing**
    : Write tests for your stories to ensure they work as expected. Use [Jest](https://jestjs.io/) for unit testing and snapshot testing of your React components.

    **Application Testing**
    : Use [Cypress](https://www.cypress.io/) for end-to-end testing to simulate real user interactions and ensure your application behaves correctly.

    **Test Coverage**
    : Maintain good test coverage to ensure that your critical features are well-protected during updates. Tools like Jest provide [coverage reports](https://jestjs.io/docs/code-coverage) that help you identify untested parts of your code.

=== "Accessibility"

    Make your application accessible to all users. Use semantic HTML, ARIA attributes, and test your application with different screen sizes and assistive technologies.

!!! note
    If you create an export function or component in `diracx-web-components`, you must add it to the `index.ts` file and run `npm run build` inside `packages/diracx-web-components` to ensure the pre-commit hook passes.

!!! warning
    Don't forget to update the `packages/extensions` code if you integrate breaking changes in the `diracx-web-components` library. See [Managing the extension](manage_web_extension.md) for further details.

!!! note "Pre-commit Hooks"
    `Husky` is configured to run as a pre-commit script, executing tasks such as linting staged files to maintain code consistency with the codebase.
