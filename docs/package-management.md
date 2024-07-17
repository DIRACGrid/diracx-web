# Package Management in the Monorepo

## Using Local Packages

When working on `diracx-web`, the monorepo configuration ensures that related packages (`diracx-web-components`) are automatically used from their local versions instead of fetching them from the npm registry. This setup allows developers to see the latest changes in real-time, so that any updates or modifications to these packages are immediately reflected in the `diracx-web` application during development.

This approach streamlines the development process, reduces the need for frequent publishing to npm, and ensures consistency across the project.

### Configuration

Our monorepo is configured to use npm workspaces, which allows us to specify the projects and packages that should be linked locally.

From the [npm documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces):

> Workspaces is a generic term that refers to the set of features in the npm cli that provides support for managing multiple packages from your local file system from within a singular top-level, root package.
>
> This set of features makes up for a much more streamlined workflow handling linked packages from the local file system. It automates the linking process as part of npm install and removes the need to manually use npm link in order to add references to packages that should be symlinked into the current node_modules folder.

**Example `package.json` Configuration:**

```json
{
  "workspaces": ["packages/diracx-web-components", "packages/diracx-web"]
}
```

Note that any packages not listed in the `workspaces` (i.e. `diracx-web-extension-example` here) array are not considered workspaces. They will not be managed from the root of the monorepo and will not have access to the linked packages in the root `node_modules`, hence they will fetch them from the npm registry.
Additionally, these packages will have their own `node_modules` folder.
