# Creating a Next.js DiracX Web Extension

This project aims to provide an example for creating a basic Next.js web extension for DiracX. It includes the necessary configuration and setup to get you started quickly.

## Prerequisites

Before starting, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)

## Getting Started

You can either create a new repository or fork this repository to build your DiracX extension. Follow one of the methods below:

### Method 1: Fork the Repository

1. **Fork this repository** on GitHub.
2. **Clone the forked repository** to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/diracx-web-extension-example.git
   cd diracx-web-extension-example
   ```

### Method 2: Create a New Next.js Project

1. **Create a new Next.js project** using the following command:

   ```bash
   npx create-next-app your-extension
   cd your-extension
   ```

2. **Add the OIDC postinstall script** to your `package.json` file to copy necessary service worker files:

   ```json
   "scripts": {
     "postinstall": "node ./node_modules/@axa-fr/react-oidc/bin/copy-service-worker-files.mjs public"
   }
   ```

3. **Modify the app pages** to use components from the `diracx-components` library (e.g., providers, apps).

### Install Dependencies

Install the required dependencies for your project:

```bash
npm install
```

### Running the Extension with DiracX Charts

To start your DiracX extension follow these steps:

1. **Clone the `diracx-charts` repository** in a parent directory:

   ```bash
   git clone git@github.com:DIRACGrid/diracx-charts.git
   ```

2. **Run the demo script** with the path to your extension:

   ```bash
   ./diracx-charts/run_demo.sh path/to/your-extension
   ```

This will run the DiracX Demo with your extension.

## Customizing the Extension

You can customize your extension by modifying the files in the `src` directory. This is where you’ll find the main components and logic of your extension.

Having a directory dedicated to your extension components will help you keep your code organized and easy to maintain.

### Extending the DiracX Apps

To add new apps to your extension, you can create new components in your extension directory.
It is then pretty easy to add them to DiracX Web by extending the `applicationList` from `diracx-web-components/components`, and passing the new list to the `ApplicationProvider` from `diracx-web-components/contexts`.

```tsx
import { ApplicationProvider } from "@diracgrid/diracx-web-components/contexts";
import { applicationList } from "@diracgrid/diracx-web-components/components";

const newApp = {
  name: "New App",
  icon: new-app-icon,
  component: NewAppComponent,
};

const newApplicationList = [...applicationList, newApp];

//...
<ApplicationProvider appList={newApplicationList}>...</ApplicationProvider>;
```

Feel free to explore and adjust the code to fit your requirements.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). Please refer to the [LICENSE](LICENSE) file for more details.
