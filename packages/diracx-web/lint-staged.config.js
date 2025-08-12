export default {
  // Run eslint on the typescript files because the eslint config is only for typescript files
  "*.{ts,tsx}": "eslint --fix",
  "*.{js,ts,jsx,tsx,css,md}": "prettier --write",
  "**/*.{ts,tsx}": () => "tsc --noEmit",
};
