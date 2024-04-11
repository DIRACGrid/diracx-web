![Basic tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/basic.yml/badge.svg?branch=main)
![Basic tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/test.yml/badge.svg?branch=main)
![Basic tests](https://github.com/DIRACGrid/diracx-web/actions/workflows/containerised.yml/badge.svg?branch=main)

# DiracX-Web Prototype

## Getting started

This will allow you to run a demo setup.

The code changes will be reflected in the demo.

Requirement: docker, internet

```bash
# Clone the diracx repository
git clone git@github.com:DIRACGrid/diracx.git

# Clone the diracx-web repository
git clone git@github.com:DIRACGrid/diracx-web.git

# Clone the diracx-chart repository
git clone git@github.com:DIRACGrid/diracx-charts.git

# Run the demo
diracx-charts/run_demo.sh diracx/ diracx-web/
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the result.

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

```
npm test
```

End-to-end tests are launched through `cypress` such as:

```
npx cypress open --config baseUrl=$DIRACX_URL
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
