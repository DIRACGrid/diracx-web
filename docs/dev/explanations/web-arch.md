# Web architecture Overview

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

This repository is organized as a monorepo, with the following key packages:

=== "DiracX-Web-Components"

    **Purpose**: A library of reusable React components  
    **Location**: `packages/diracx-web-components`  
    **Description**: Designed for integration within the `DiracX-Web` package and to facilitate the creation of custom DiracX web extensions.

=== "DiracX-Web" 

    **Purpose**: Main web application  
    **Location**: `packages/diracx-web`  
    **Description**: Vanilla Dirac web interface based on Next.js. Leverages components from `DiracX-Web-Components` to provide core functionalities.

=== "Extensions"

    **Purpose**: Example extension implementation  
    **Location**: `packages/extensions`  
    **Description**: An illustrative example of a web extension, also based on Next.js, demonstrating how to extend the functionality of `DiracX-Web` using the components from the `DiracX-Web-Components` package.

!!! info "Monorepo Structure"
    The monorepo structure is based on *npm workspaces* to ensure that related packages ([DiracX-Web-Components](packages/diracx-web-components)) are automatically used from their local versions instead of fetching them from the npm registry.