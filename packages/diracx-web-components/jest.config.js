/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
/** @type {import('jest').Config} */
const config = {
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // The test environment that will be used for testing
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@axa-fr/react-oidc$": "<rootDir>/stories/mocks/react-oidc.mock.tsx",
    "^../../hooks/metadata$": "<rootDir>/stories/mocks/metadata.mock.tsx",
    "^./jobDataService$": "<rootDir>/stories/mocks/jobDataService.mock.tsx",
    "\\.css$": "<rootDir>/stories/mocks/style.mock.ts",
  },

  // To support ESM modules in Jest
  transformIgnorePatterns: [
    "/node_modules/(?!d3|d3-[^/]+|internmap|delaunator|robust-predicates)",
  ],

  // Tell Jest how to transform files
  // Use ts-jest for TypeScript files and babel-jest for JavaScript files
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

export default config;
