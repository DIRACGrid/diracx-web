export default {
  "*.{js,ts,jsx,tsx}": "eslint --cache --fix",
  "*.{js,ts,jsx,tsx,css,md}": "prettier --write",
  "**/*.{ts,tsx}": () => "tsc --noEmit",
};
