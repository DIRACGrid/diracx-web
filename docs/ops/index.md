# Administrator Guide

Welcome to the DiracX-Web Administrator Guide! This comprehensive resource is designed to assist you in effectively managing, deploying, and maintaining the DiracX-Web repository. Whether you're overseeing releases, handling dependencies, or configuring the system, this guide provides the necessary insights and instructions.

The following graph gives you an overview of the [Github Action Workflows](../../.github/workflows/):

```mermaid
---
config:
  layout: elk
---
flowchart TD
 subgraph basic-checks["Basic Checks"]
        checks["Linting and Commit format checking"]
  end
 subgraph lib-test["DiracX-Web-Components Tests"]
        unit-tests["Unit Tests"]
  end
 subgraph diracx-web-test["DiracX-Web Tests"]
        integration-tests["Integration Tests"]
  end
 subgraph gubbins-test["Extensions[Gubbins] Tests"]
        lint["Linting"]
        standalone["Prepare Gubbins as a standalone"]
        ext-docker["Build docker dev image"]
        ext-integration-tests["Integration Tests"]
  end
 subgraph deployment["Deployment"]
        main:release-please["Release Please: Create/Update PR"]
        rel:release-please["Release Please: Push tags & releases"]
        main:build-deploy-lib["Build diracx-web-components"]
        docker-dev["Build & Push dev image"]
        storybook["Build Storybook"]
        rel:deploy-storybook["Deploy Storybook"]
        rel:build-deploy-lib["Publish diracx-web-components on NPM"]
        rel:docker-release["Push release image"]
  end
    standalone -- is needed for --> ext-docker & ext-integration-tests
    basic-checks ~~~ lib-test
    lib-test ~~~ diracx-web-test & gubbins-test
    diracx-web-test ~~~ deployment
    gubbins-test ~~~ deployment
    main:release-please -- is needed for --> main:build-deploy-lib
    rel:release-please -- is needed for --> rel:build-deploy-lib & rel:deploy-storybook & rel:docker-release
    storybook -- is needed for --> rel:deploy-storybook
    main:build-deploy-lib -- is needed for --> rel:build-deploy-lib
     rel:release-please:::Rose
     rel:deploy-storybook:::Rose
     rel:build-deploy-lib:::Rose
     rel:docker-release:::Rose
    classDef Rose stroke-width:1px, stroke-dasharray:none, stroke:#FF5978, fill:#FFDFE5, color:#8E2236

```


## Content

- [Deploy DiracX-Web](./deploy_instance.md)
- [Manage dependencies](./manage_dependencies.md)
- [Manage releases](./manage_release.md)