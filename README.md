![Basic tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/basic.yml/badge.svg?branch=main)
![Unit tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/test.yml/badge.svg?branch=main)
![Integration tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/integration-test.yml/badge.svg?branch=main)
![Deployment](https://github.com/DIRACGrid/diracx-web/actions/workflows/deployment.yml/badge.svg?branch=main)

# DiracX-Web

## Overview

`diracx-web` is a web application that provides a user interface to interact with the [DiracX](https://github.com/DIRACGrid/diracx) service and is part of the [DIRAC](https://github.com/DIRACGrid) ecosystem.

This repository is organized as a monorepo, with the following key packages:

- [diracx-web](packages/diracx-web)
- [diracx-web-components](packages/diracx-web-components)
- [extensions](packages/extensions)

```mermaid
---
config:
  layout: elk
---
flowchart TD
 subgraph monorep["Monorepo"]
        monorep1["diracx-web-components"]
        monorep2["diracx-web"]
        monorep3["extension[gubbins]"]
  end
    monorep2 -- images deployed in --> docker[" "]
    monorep3 -- images deployed in --> docker
    monorep2 -. uses .-> monorep1
    monorep3 -. uses .-> monorep1
    monorep1 -- documented on --> storybook[" "]
    monorep1 -- published on --> npm[" "]
    extension["diracx-community-extension"] -. uses .-> npm
    docker@{ img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLQKd_MRed_mZQlgrzQuUXVA3P39ssOVX8_g&s", h: 100, w: 100}
    storybook@{ img: "https://miro.medium.com/v2/resize:fit:900/1*ZuBTYHXl6l3XzTb8d9Oi5Q.png", h: 100, w: 150, pos: "b"}
    npm@{ img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Npm-logo.svg/2560px-Npm-logo.svg.png", h: 40, w: 100}
     monorep1:::Ash
     monorep1:::Cyan
     monorep2:::Green
     monorep3:::Green
     extension:::Ash
    classDef Cyan stroke-width:1px, stroke-dasharray:none, stroke:#00FFFF, fill:#9CFFFF
    classDef Green stroke-width:1px, stroke-dasharray:none, stroke:#5BFF00, fill:#A4FF8E, color:#374D7C
    classDef Ash stroke-width:1px, stroke-dasharray:none, stroke:#999999, fill:#EEEEEE, color:#000000
```

### Packages

- **DiracX-Web**: Vanilla Dirac web interface based on Next.js. Leverages components from `DiracX-Web-Components` to provide core functionalities.

- **DiracX-Web-Components**: A library of reusable React components designed for integration within the `DiracX-Web` package and to facilitate the creation of custom DiracX web extensions.

- **Extensions**: An illustrative example of a web extension demonstrating how to extend the functionality of `DiracX-Web` using the components from the `DiracX-Web-Components` package.

### Project Management

- [**npm**](https://docs.npmjs.com/): Used for dependency management.
- [**Release-Please**](https://github.com/googleapis/release-please): Automated release management for the project.

The dependency management is further detailed in the [Package Management](docs/package-management.md) documentation.

For more detailed and interactive documentation, visit our [Storybook](https://diracgrid.github.io/diracx-web) instance.

## Getting started

_Requirements: docker, internet_

This will allow you to run a demo setup:

```bash
# Clone the diracx-chart repository
git clone git@github.com:DIRACGrid/diracx-charts.git

# Run the demo
diracx-charts/run_demo.sh
```

You can also start the demo setup in development mode - code changes will be reflected in the demo in real time:

```bash
# Clone the diracx-web repository
git clone git@github.com:DIRACGrid/diracx-web.git

# Clone the diracx-chart repository
git clone git@github.com:DIRACGrid/diracx-charts.git

# Run the demo
diracx-charts/run_demo.sh ./diracx-web
```

## Contributing

See the [Contributing guidelines](/CONTRIBUTING.md)

## Testing

Unit tests can be started with:

```bash
npm test
```

End-to-end tests are launched through `cypress` such as:

```bash
# diracx-charts/run_demo.sh is running
npx cypress open --config baseUrl=$DIRACX_URL
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
