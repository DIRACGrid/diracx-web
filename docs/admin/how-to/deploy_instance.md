# Deploying the web interface
## DiracX-Web

### Development mode

Refer to the [Developer Guide: Getting Started](../../dev/tutorials/getting_started.md) for instructions on running `diracx-web` in development mode.

### Production mode

To deploy `diracx-web` in a production environment, you need to customize the [`diracx` Helm Chart](https://github.com/DIRACGrid/diracx-charts) values. Key parameters include:

```yaml title="Helm Chart values for production deployment"
global.images.web.tag: <latest diracx-web version, docker tag>
global.images.web.repository: <diracx-web docker image>
```

!!! tip "Version Configuration"
    Make sure to update these values to point to the appropriate Docker image and version for your deployment.

### Integrating new features/hotfixes

=== "Testing Features"

    To hotfix `diracx-web` or test new features, you can provide a specific PR within [`diracx` Helm Chart](https://github.com/DIRACGrid/diracx-charts) values, such as:

    ```yaml title="Helm Chart values for feature testing"
    diracxWeb.repoURL: <repository hosting the branch you want to apply>
    diracxWeb.branch: <branch hosting the changes you want to apply>
    ```

=== "Production Hotfixes"

    For urgent production hotfixes:
    
    1. Create a hotfix branch from the production release
    2. Apply the minimal fix required  
    3. Test thoroughly in a staging environment
    4. Update the Helm Chart values to point to the hotfix image

!!! warning "Deployment Safety"
    Always test changes in a staging environment before applying to production.

## Extension


### `gubbins` extension in development mode

For managing the `gubbins` extension in development mode, refer to the [Developer Guide: Managing an extension](../../dev/how-to/manage_extension.md).

### `gubbins` extension in development mode, as a standalone

By default, the `gubbins` extension is part of a monorepo and uses a local version of `diracx-web-components`. This setup is not representative of a standalone extension configuration.

To deploy gubbins as a standalone package:
- **Isolate the `packages/extensions` directory:** Copy the content of `packages/extensions` to a new repository or directory outside the monorepo.
- **Update Configuration:** Adjust relevant variables to align with a standalone setup. Review the gubbins-test GitHub Action workflow for required changes.
