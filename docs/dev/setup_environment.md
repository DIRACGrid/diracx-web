# Setting up your Development Environment

```mermaid
---
config:
  layout: elk
---
flowchart TD
 subgraph root-cmds["root package.json"]
        root:dev["dev"]
        root:test["test"]
        root:build["build"]
        root:test:lib["test:diracx-web-components"]
        root:build:lib["build:diracx-web-components"]
        root:doc:lib["doc:diracx-web-components"]
  end
 subgraph lib-cmds["diracx-web-components package.json"]
        tsup:watch["tsup --watch"]
        lib:dev["dev"]
        jest["jest"]
        lib:test["test"]
        tsup:build["tsup"]
        lib:build["build"]
        storybook["storybook dev"]
        lib:storybook["doc"]
  end
 subgraph diracx-web-cmds["diracx-web package.json"]
        nextdev["next dev"]
        diracx-web:dev["dev"]
        cypress["cypress"]
        diracx-web:test["test"]
        next["next build"]
        diracx-web:build["build"]
  end
 subgraph diracx-web["diracx-web"]
        diracx-src["/src"]
        diracx-out["/out"]
  end
 subgraph lib["diracx-web-components"]
        lib-src["/src"]
        lib-out["/dist"]
  end
    lib:dev --> tsup:watch
    lib:test --> jest
    lib:build --> tsup:build
    lib:storybook --> storybook
    diracx-web:dev -.-> nextdev
    diracx-web:test -.-> cypress
    diracx-web:build -.-> next
    user["Developer"] --> root-cmds
    root:test:lib -- calls --> lib:test
    root:build:lib -- calls --> lib:build
    root:doc:lib -- calls --> lib:storybook
    root:dev -- calls --> diracx-web:dev
    root:build -- calls --> diracx-web:build
    root:test -- calls --> diracx-web:test
    root:test ~~~ gubbins-cmds["**extensions[gubbins] package.json**"]
    cypress -- uses --> diracx-src
    nextdev -- uses --> diracx-src
    nextdev -. watches(next config) .-> lib-src
    next -- builds --> diracx-out
    next -. needs .-> lib-out
    tsup:watch -- builds --> lib-out
    tsup:watch -. watches .-> lib-src
    jest -- uses --> lib-src
    tsup:build -- builds --> lib-src
    storybook -- uses --> lib-src
     root:dev:::Ash
     root:test:::Ash
     root:build:::Ash
     root:test:lib:::Ash
     root:build:lib:::Ash
     root:doc:lib:::Ash
     tsup:watch:::Rose
     lib:dev:::Ash
     jest:::Rose
     lib:test:::Ash
     tsup:build:::Rose
     lib:build:::Ash
     storybook:::Rose
     lib:storybook:::Ash
     nextdev:::Rose
     diracx-web:dev:::Ash
     cypress:::Rose
     diracx-web:test:::Ash
     next:::Rose
     diracx-web:build:::Ash
     diracx-src:::Peach
     diracx-out:::Peach
     lib-src:::Peach
     lib-out:::Peach
    classDef Ash stroke-width:1px, stroke-dasharray:none, stroke:#999999, fill:#EEEEEE, color:#000000
    classDef Peach stroke-width:1px, stroke-dasharray:none, stroke:#FBB35A, fill:#FFEFDB, color:#8F632D
    classDef Rose stroke-width:1px, stroke-dasharray:none, stroke:#FF5978, fill:#FFDFE5, color:#8E2236
    style user stroke:#000000
    style lib fill:#d99fe3,stroke:#FFCDD2,color:#000000
    style diracx-web fill:#d99fe3,stroke:#FFCDD2,color:#000000
```

## Running DiracX-Web in development mode

_Requirements: node, npm_

You can start `DiracX-Web` as an `npm` application connecting to a remote backend server - code changes will be reflected in the demo in real time.

```bash
# Clone the diracx-web repository
git clone git@github.com:DIRACGrid/diracx-web.git

cd diracx-web

# Install it
npm ci

# Set the DiracX backend URL you are targeting
export DIRACX_URL=<backend url>

# Run it
npm run dev
```

## Running DiracX-Web in development mode along DiracX

_Requirements: docker, internet, node_

If you need to modify `DiracX` in parallel, or if you do not have access to the remote backend logs,
then you can also start the full demo setup in development mode:

```bash
# Clone the diracx-web repository
git clone git@github.com:DIRACGrid/diracx-web.git

# [Optional] Clone the diracx repository
git clone git@github.com:DIRACGrid/diracx.git

# Clone the diracx-chart repository
git clone git@github.com:DIRACGrid/diracx-charts.git

# Run the demo
diracx-charts/run_demo.sh ./diracx-web [./diracx]
```

:bulb: Any change made in `diracx-web-components` are automatically reflected into the development environment. We rely on the [NextJS transpile option](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages). Further details are available in the `diracx-web` NextJS configuration.

## Testing

[Jest](https://jestjs.io/) unit tests can be started with:

```bash
npm run test:diracx-web-components
```

End-to-end tests are launched through [Cypress](https://www.cypress.io/) such as:

```bash
# diracx-charts/run_demo.sh is running
export DIRACX_URL=<diracX installation>
npm run --prefix packages/diracx-web test
```

## Documenting

[Storybook](https://storybook.js.org/docs) can be started with:

```bash
npm run doc:diracx-web-components
```
