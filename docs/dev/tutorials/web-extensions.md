# Creating a DiracX Web Extension

![CI](https://github.com/DIRACGrid/diracx-web/actions/workflows/gubbins-test.yml/badge.svg?branch=main)

This project aims to provide an example for creating a basic Next.js web extension for DiracX. It includes the necessary configuration and setup to get you started quickly.

## Prerequisites

Before starting, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

And ensure you have basic knowledge of:

- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [MUI](https://mui.com/)

## Getting Started

You can either create a new repository or start from this one to build your DiracX extension. Follow one of the methods below:

### Method 1: Fork the Repository

1. **Clone this repository** on GitHub, move and rename the `diracx-web/packages/extensions` directory:

   ```bash
   git clone https://github.com/DIRACGrid/diracx-web.git
   mv diracx-web/packages/extensions </path/to/different/location>
   cd </path/to/different/location>
   ```

2. **Slightly modify the `package.json` file**

   From `</path/to/different/location>`, execute the following command:

   ```bash
   # Adapt the path of the copy-service-worker-files script
   jq '.scripts.postinstall = "node ./node_modules/@axa-fr/react-oidc/bin/copy-service-worker-files.mjs public"' ./package.json > ./package.temp.json
   mv ./package.temp.json ./package.json
   # Adapt the package name and version
   jq '.name = "<YOUR EXTENSION NAME>"' ./package.json > ./package.temp.json
   mv ./package.temp.json ./package.json
   jq '.version = "0.1.0-a0"' ./package.json > ./package.temp.json
   mv ./package.temp.json ./package.json
   ```

3. **Remove `CHANGELOG.md`**

### Method 2: Create a New Next.js Project

1. **Create a new Next.js project** using the following command:

   ```bash
   npx create-next-app your-extension
   cd your-extension
   ```

2. **Add the DiracX Web Components Library** to your project:

   ```bash
   npm install @dirac-grid/diracx-web-components
   ```

   To include additional dependencies in your project, such as `cypress` for end-to-end tests, you can follow these steps:

   Run the following command to install the desired dependency:

   ```bash
   npm install <dependency-name>
   ```

   Add the `--save-dev` or `-D` flag to install the dependency as a development dependency.

   Replace `<dependency-name>` with the name of the dependency you want to install.

   For example, to install `cypress`, run:

   ```bash
   npm install cypress -D
   ```

   Make sure to consult the documentation of each dependency for further instructions on how to use them in your project.

   For `cypress`, you can refer to the [Cypress documentation](https://docs.cypress.io/guides/overview/why-cypress.html) for detailed usage instructions.

3. **Add the OIDC postinstall script** to your `package.json` file to copy necessary service worker files:

   ```json
   "scripts": {
     "postinstall": "node ./node_modules/@axa-fr/react-oidc/bin/copy-service-worker-files.mjs public"
   }
   ```

   This is needed to update the service worker files when the OIDC library version changes.

   See the [OIDC library documentation](https://github.com/AxaFrance/oidc-client/tree/main/packages/react-oidc#getting-started) for more information.

   Note: for backendless local development, replace the `dev` command by:

   ```json
   "scripts": {
     "dev": "export NEXT_PUBLIC_DIRACX_URL=$DIRACX_URL; next dev",
     ...
   }
   ```

   This avoids having to set 2 environment variables with the same value: NextJS can only read from variables prefixed with `NEXT_PUBLIC`.

4. **Edit the Next.js config** with these options:

   ```js
      output: "export",
      images: {
         unoptimized: true,
      },
   ```

   The output is set to `export` to have a static application.
   Images are left unoptimized because it's not well-supported with a static export.

5. **Add the nginx config** located in the [`config/nginx`](https://github.com/DIRACGrid/diracx-web/tree/main/packages/extensions/config/nginx) directory.
   This adjustment ensures that Nginx can correctly handle requests for .html files and fall back appropriately, preventing the `404: Not Found` errors encountered when accessing routes like `/auth`. (see [#57](https://github.com/DIRACGrid/diracx-web/pull/57))

6. **Organize your pages** in the `src/app` app directory.
   The `<DiracXWebProviders>` context is needed by most of the components of `diracx-web-components`, so you should include it in the layouts of your application. Use `<OIDCSecure>` to require authentication on a route. You can also override some default values of certain contexts like `<ApplicationProvider>` for the application list.
   Finally, some components have some personalization options (i.e. the logo URL for the dashboard), check the [Storybook documentation](https://diracgrid.github.io/diracx-web/) to see the props of each component.
   Check [the app directory](https://github.com/DIRACGrid/diracx-web/tree/main/packages/extensions/src/app) in this example to have a reference.

### Architecture

We strongly recommend following the directory structure below to keep your project organized:

- `/src/app`: Contains the main application logic and Next.js setup. This directory houses the core of the application built using Next.js, where each page.tsx file represents a page in the application with [folder-based routing](https://nextjs.org/docs/app/building-your-application/routing). [Next.js Official Documentation](https://nextjs.org/docs).
  The page.tsx files contain the UI for a route and layout.tsx files handles the shared UI for a segment and its children.
  In this example the `(Dashboard)` folder manages the main interface where users interact with the app's primary functions. Names in parentheses are ignored for the route, so it is the root URL.
  The `auth` folder handles the authentication of users, and the route is `/auth`.

- `/src/<your extension>`: This directory includes the source code related to your extension. You can create custom components, hooks, ... in this directory.
  - `/src/<your extension>/components`: Contains custom React components. This folder includes reusable UI components built using React. Components in React are independent, reusable pieces of UI that can manage their own state. [React Components](https://reactjs.org/docs/components-and-props.html)
  - `/src/<your extension>/contexts`: Manages global state using React Context. This folder contains context providers which are used to manage and share global state across the application. React Context provides a way to pass data through the component tree without having to pass props down manually at every level. [React Context](https://reactjs.org/docs/context.html)
  - `/src/<your extension>/hooks`: Custom React hooks for encapsulating reusable logic. This directory includes custom hooks. Hooks are special functions that let you "hook into" React state and lifecycle features from function components. [React Hooks](https://reactjs.org/docs/hooks-intro.html)
  - `/src/<your extension>/types`: TypeScript type definitions for the application. This folder contains TypeScript type definitions to ensure type safety throughout the application.

### Running the Extension with DiracX Charts

To start your DiracX extension in development mode follow these steps:

1. **Clone the `diracx-charts` repository** in a parent directory:

   ```bash
   git clone git@github.com:DIRACGrid/diracx-charts.git
   ```

2. **Run the demo script** with the path to your extension:

   ```bash
   ./diracx-charts/run_demo.sh path/to/your-extension
   ```

To run your extension in a production environment, you need to customize the [`diracx` Helm Chart](https://github.com/DIRACGrid/diracx-charts) values, such as:

```yaml
global.images.web.tag: <your extension version, docker tag>
global.images.web.repository: <your extension docker image>
```

## Customizing the Extension

You can customize your extension by modifying the files in the `src` directory. This is where you’ll find the main components and logic of your extension.

Having a directory dedicated to your extension components will help you keep your code organized and easy to maintain.

### Extending the DiracX Apps

To add new apps to your extension, you can create new components in your extension directory.

[`testApp`](https://github.com/DIRACGrid/diracx-web/blob/main/packages/extensions/src/gubbins/components/TestApp/testApp.tsx) provides an example of a basic app component and the [Storybook documentation](https://diracgrid.github.io/diracx-web/) showcases all the components you can use from the library in an interactive interface.

It is then pretty easy to add them to DiracX Web by extending the `applicationList` (the list of apps available in DiracX-Web) from `diracx-web-components/components`.

Context providers are used to manage and share global state across the application. You can use the `ApplicationProvider` from `diracx-web-components/contexts` to pass the list of applications to the components that need it.
It is used in this example in the [(Dashboard) directory's layout.tsx](https://github.com/DIRACGrid/diracx-web/blob/main/packages/extensions/src/app/(dashboard)/layout.tsx) file.

If you need more info on Contexts, you can check the [React documentation](https://reactjs.org/docs/context.html).

```tsx
// import the Application Context Provider and the default application list from the library
import { ApplicationProvider } from "@dirac-grid/diracx-web-components/contexts";
import { applicationList } from "@dirac-grid/diracx-web-components/components";

// The new Application you want to add
const newApp = {
  name: "New App", // Its name
  icon: new-app-icon, // An icon for the app, you can import some from "@mui/icons-material"
  component: NewAppComponent, // The component you made for your Application
};

// Make a new list with all elements of the default list + the new application
const newApplicationList = [...applicationList, newApp];

// Use your new list by passing in the Application provider in a page's layout
<ApplicationProvider appList={newApplicationList}>...</ApplicationProvider>;
```

In this example, the new App list is defined in a [separate file](https://github.com/DIRACGrid/diracx-web/blob/main/packages/extensions/src/gubbins/applicationList.ts)

Feel free to explore and adjust the code to fit your requirements.

## Deployment

Deployment of the extension can be done using the Dockerfile provided in the repository. The Dockerfile builds the Next.js application and serves it using a nginx server.

See [Docker's Documentation](https://docs.docker.com/get-started/) for more information on how to deploy your application using Docker.
It can be automatically deployed using CI/CD tools like GitHub Actions, GitLab CI/CD, or Jenkins.

## Good Practices

- **Code Quality**: Ensure your code is clean, well-documented, and follows best practices. Use tools like [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) to maintain code quality.

- **Testing**:
  - **Component Testing**: Write tests for your components to ensure they work as expected. Use [Jest](https://jestjs.io/) for unit testing and snapshot testing of your React components.
  - **Application Testing**: Use [Cypress](https://www.cypress.io/) for end-to-end testing to simulate real user interactions and ensure your application behaves correctly.
  - **Test Coverage**: Maintain good test coverage to ensure that your critical features are well-protected during updates. Tools like Jest provide [coverage reports](https://jestjs.io/docs/code-coverage) that help you identify untested parts of your code.

- **Accessibility**: Make your extension accessible to all users. Use semantic HTML, ARIA attributes, and test your extension with different screen sizes and assistive technologies.

- **Security**:
  - **Dependency Management**: Keeping dependencies up to date is crucial for security and performance. Using deprecated packages can expose your application to known vulnerabilities.
  - **Identifying Vulnerabilities**: Regularly check for known vulnerabilities in your dependencies. Tools like [`npm audit`](https://docs.npmjs.com/cli/v7/commands/npm-audit) can help spot these issues.
  - **Automating Updates**: Use tools like [Dependabot](https://github.com/dependabot) or [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate/) to automate dependency updates. These tools can automatically create pull requests to update dependencies, making it easier to stay current and see if updates are compatible with tests used in CI. Keeping dependencies up to date is crucial for security as deprecated packages can expose your application to known vulnerabilities.

By following these practices, you'll ensure that your codebase remains robust, secure, and maintainable.
