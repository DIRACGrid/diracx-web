# Deploying the web interface
## DiracX-Web

### Development mode

Refer to the [Developer Guide: Setting up you Development Environment](../developer/setup_environment.md) for instructions on running `diracx-web` in development mode.

### Production mode

To deploy `diracx-web` in a production environment, you need to customize the [`diracx` Helm Chart](https://github.com/DIRACGrid/diracx-charts) values. Key parameters include:

```yaml
global.images.web.tag: <latest diracx-web version, docker tag>
global.images.web.repository: <diracx-web docker image>
```

:bulb: Make sure to update these values to point to the appropriate Docker image and version for your deployment.

### Integrating new features/hotfixes

To hotfix `diracx-web`, test new features, you can provide a specific PR within [`diracx` Helm Chart](https://github.com/DIRACGrid/diracx-charts) values, such as:

```yaml
diracxWeb.repoURL: <repository hosting the branch you want to apply>
diracxWeb.branch: <branch hosting the changes you want to apply>
```

:bulb: Make sure to update these values to point to the appropriate Docker image and version for your deployment.

## Extension


### `gubbins` extension in development mode

For managing the `gubbins` extension in development mode, refer to the [Developer Guide: Managing an extension](../developer/manage_extension.md).

### `gubbins` extension in development mode, as a standalone

By default, the `gubbins` extension is part of a monorepo and uses a local version of `diracx-web-components`. This setup is not representative of a standalone extension configuration.

To deploy gubbins as a standalone package:
- **Isolate the `packages/extensions` directory:** Copy the content of `packages/extensions` to a new repository or directory outside the monorepo.
- **Update Configuration:** Adjust relevant variables to align with a standalone setup. Review the required changes in the [gubbins-test Github Action workflow](../../.github/workflows/gubbins-test.yml).
