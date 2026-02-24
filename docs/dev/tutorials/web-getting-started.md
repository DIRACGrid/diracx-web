# Getting Started with DiracX Web Development

This tutorial walks you through setting up a DiracX Web development environment, making your first change, and running tests.

## Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)
- [Git](https://git-scm.com/)

You should also have basic knowledge of:

- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Material UI (MUI)](https://mui.com/)

## Setting up the environment

Follow the [Setup web environment](../how-to/setup-web-environment.md) guide to clone the repository and install dependencies:

```bash
git clone git@github.com:DIRACGrid/diracx-web.git
cd diracx-web
npm ci
```

## Running the development server

Start the development server against a remote DiracX backend:

```bash
export DIRACX_URL=<backend url>
npm run dev
```

The application will be available at `http://localhost:3000`. Changes to source files are reflected in real time.

## Project structure

The repository is a monorepo with three main packages:

- **`packages/diracx-web-components`** — Reusable React component library published to npm
- **`packages/diracx-web`** — Main Next.js application that consumes the components
- **`packages/extensions`** — Example extension (`gubbins`) showing how to build custom extensions

## Making your first change

1. Open `packages/diracx-web-components/src/components/` and pick a component to modify.
2. Make a small change (e.g. update a label or add a tooltip).
3. The dev server will hot-reload your change automatically.

## Running tests

**Unit tests** (Jest + React Testing Library):

```bash
npm run test:diracx-web-components
```

**End-to-end tests** (Cypress — requires a running DiracX backend):

```bash
export DIRACX_URL=<diracx-backend-url>
npm run --prefix packages/diracx-web test
```

**Storybook** (interactive component documentation):

```bash
npm run doc:diracx-web-components
```

## Next steps

- [Creating a web extension](web-extensions.md) — Build a custom DiracX web extension
- [Create a web application](../how-to/create-web-application.md) — Add a new application to DiracX Web
- [Contribute to web](../how-to/contribute-to-web.md) — Contribution guidelines for DiracX Web
