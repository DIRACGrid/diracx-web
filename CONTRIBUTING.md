# Contributing to This Project

Thank you for your interest in contributing to our project! We appreciate all contributions, big and small. Below are some guidelines to help you get started.

## How to Contribute

### 1. Opening an Issue

- **Discuss Before Implementing:** Before making a pull request (PR), especially for non-trivial changes, please [open an issue](https://github.com/DIRACGrid/diracx-web/issues) to discuss your idea. This ensures that everyone is aligned on the proposed change.
- **Check for Existing Issues:** Before opening a new issue, please check if a similar issue already exists. If a similar issue exists, consider contributing to the discussion there instead.

### 2. Making Changes

- **Code Documentation:** Ensure that any code you write is well-documented. This includes:
  - Inline comments where necessary to explain complex logic.
  - Updating or creating Storybook documentation if you are contributing to the `diracx-web-components` library.
- **Writing/Updating Tests:** When you change or add new code, make sure to write or update tests accordingly. This helps maintain the reliability and stability of the codebase.
- **Helping with Existing Issues:** If you want to start contributing right away, check out the issues labeled with ["good first issue"](https://github.com/DIRACGrid/diracx-web/labels/good%20first%20issue). These are issues that are well-suited for newcomers to the project.

### 3. Commit Messages

- **Conventional Commits:** All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures that commit messages are structured and consistent, which is important for automation and versioning.
  - **Examples:**
    - `feat(ui): add new button component`
    - `fix(api): handle null values in response`
    - `docs(readme): update contributing guidelines`
  - **Why?** If your commit messages do not follow this convention, the Continuous Integration (CI) process will fail, and your PR will not be merged. Please ensure your commit messages are properly formatted before pushing.

### 4. How to Make a Pull Request (PR)

- **Fork the Repository:** Start by forking the repository and creating a new branch for your work. Use a descriptive name for your branch that reflects the work you're doing.
- **Make Your Changes:** Commit your changes with clear and concise commit messages following the Conventional Commits format.
- **Update Documentation and Tests:** As mentioned, ensure all relevant documentation and tests are updated to reflect your changes.
- **Submit Your PR:** When you’re ready, submit your pull request. Please include a clear description of what your PR does and reference the issue number it addresses (if applicable).
- **Review Process:** Your PR will be reviewed by project maintainers. Please be patient and responsive to any feedback you receive.

### 5. Updating Storybook Stories

If your changes affect the `diracx-web-components` library, you may need to update or add new Storybook stories to ensure components are well-documented and tested visually.

- **Add New Stories:** If you’ve created a new component, add a corresponding Storybook story in the appropriate directory. This story should be placed inside a `*.stories.tsx` file alongside your new component.
- **Update Existing Stories:** If your changes modify the behavior or appearance of an existing component, make sure to update its Storybook story accordingly.
- **Run Storybook Locally:** Before submitting your PR, run Storybook locally to ensure that your changes are reflected correctly. You can do this by running `npm run storybook` in the `packages/diracx-web-components` directory.

You can check the existing stories and the [Storybook documentation](https://storybook.js.org/docs) for more details on how to use Storybook.

### 6. Additional Notes

- **Trivial Changes:** For minor changes like fixing typos, feel free to skip the issue creation step and go straight to making a PR.
- **Stay Up-to-Date:** Make sure your branch is up-to-date with the latest changes in the main branch before submitting your PR. Use `git rebase` if necessary.
- **Project Setup:** See the README for instructions on how to set up the project and run tests locally.

Thank you again for your contributions! We look forward to working with you.
