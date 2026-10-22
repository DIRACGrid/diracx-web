export default {
  // Excludes tsup.config.ts, which tsconfig.json also excludes from the type-aware project.
  "**/!(tsup.config).{ts,tsx}": ["eslint --fix", () => "tsc --noEmit"],
  "*.{js,ts,jsx,tsx,css,md}": "prettier --write",
};
