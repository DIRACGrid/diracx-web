# Dealing with an extension

## Modifying the `gubbins` extension

This implies setting up the backend as well as the frontend.

### `gubbins-web` (frontend)

```mermaid
---
config:
  layout: elk
---
flowchart TD
 subgraph root-cmds["root package.json"]
        root:dev["dev"]
  end
 subgraph gubbins-cmds["extensions[gubbins] package.json"]
        nextdev["next dev"]
        gubbins:dev["dev"]
        cypress["cypress"]
        gubbins:test["test"]
        next["next build"]
        gubbins:build["build"]
  end
 subgraph ext["extensions[gubbins]"]
        diracx-src["/src"]
        diracx-out["/out"]
  end
 subgraph lib["diracx-web-components"]
        lib-src["/src"]
        lib-out["/dist"]
  end
    user["Developer"] --> root-cmds
    gubbins:dev -.-> nextdev
    gubbins:test -.-> cypress
    gubbins:build -.-> next
    root:dev -- calls --> gubbins:dev
    root:dev ----x diracx-web-cmds["diracx-web package.json"]
    cypress -- uses --> diracx-src
    nextdev -- uses --> diracx-src
    next -- builds --> diracx-out
    next -. needs .-> lib-out
     root:dev:::Ash
     nextdev:::Rose
     gubbins:dev:::Ash
     cypress:::Rose
     gubbins:test:::Ash
     next:::Rose
     gubbins:build:::Ash
     diracx-src:::Peach
     diracx-out:::Peach
     lib-src:::Peach
     lib-out:::Peach
    classDef Ash stroke-width:1px, stroke-dasharray:none, stroke:#999999, fill:#EEEEEE, color:#000000
    classDef Peach stroke-width:1px, stroke-dasharray:none, stroke:#FBB35A, fill:#FFEFDB, color:#8F632D
    classDef Rose stroke-width:1px, stroke-dasharray:none, stroke:#FF5978, fill:#FFDFE5, color:#8E2236
    style user stroke:#000000
    style root-cmds fill:#FFFFFF,stroke:#424242,color:#000000
    style diracx-web-cmds fill:#FFFFFF,stroke:#424242,color:#000000
    style gubbins-cmds fill:#FFFFFF,stroke:#424242,color:#000000
    style lib fill:#d99fe3,stroke:#FFCDD2,color:#000000
    style ext fill:#d99fe3,stroke:#FFCDD2,color:#000000
```

You can simply, and temporarily modify `package.json` by replacing the `dev` command such as:

```bash
jq '.scripts.dev["@dirac-grid/diracx-web-components"] = "npm --prefix packages/extensions run dev"' diracx-web/package.json > diracx-web/package.temp.json
mv diracx-web/package.temp.json diracx-web/package.json
```

And you would provide the `./diracx-web` directory to `diracx-charts/run_demo.sh` as usual:

```bash
# Run the demo
diracx-charts/run_demo.sh ./diracx-web ...[backend params]

# We use the test command from packages/extensions though
export DIRACX_URL=<diracX installation>
npm run --prefix packages/extensions test
```

### `gubbins` (backend)

Follow the instructions from the [Gubbins extension README](https://github.com/DIRACGrid/diracx/tree/main/extensions#work-on-gubbins).

:bulb: Like `diracx-web`, `gubbins-web` does automatically reflect changes made in `diracx-web-components`. This means that while running `gubbins` using `diracx-charts/run_demo.sh`, any modifications to `diracx-web-components` will also be applied to `gubbins`.

## Creating a new extension

More details available in the [**extensions** README](../../packages/extensions/README.md)