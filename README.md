![Basic tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/basic.yml/badge.svg?branch=main)
![Unit tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/test.yml/badge.svg?branch=main)
![Integration tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/integration-test.yml/badge.svg?branch=main)
![Deployment](https://github.com/DIRACGrid/diracx-web/actions/workflows/deployment.yml/badge.svg?branch=main)

# DiracX-Web

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

- Want to report a bug?
  Open an [Issue](https://github.com/DIRACGrid/diracx-web/issues).
- Need technical support to configure `diracx-web`?
  Start a [Support discussion](https://github.com/DIRACGrid/diracx-web/discussions/categories/support).

- Want to make a general feedback about the [DIRAC web application](https://github.com/DIRACGrid/WebAppDIRAC)?
  Answer to the [Survey](https://github.com/DIRACGrid/diracx-web/discussions/categories/surveys) by creating a new discussion.
- Want to request a feature?
  Create a [User Story](https://github.com/DIRACGrid/diracx-web/discussions/categories/user-personas-and-stories) to describe your need.
- Want to discuss about UX/UI design?
  Share your [Design idea](https://github.com/DIRACGrid/diracx-web/discussions/categories/design-ideas).

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
