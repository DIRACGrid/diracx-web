import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const mocksDir = dirname(fileURLToPath(import.meta.url));

/**
 * Modules replaced by their story mocks, shared by Storybook and Vitest so
 * that stories and the tests composed from them render the same modules.
 */
export const storyMockAliases: Record<string, string> = {
  "@axa-fr/react-oidc": resolve(mocksDir, "react-oidc.mock.tsx"),
  "../../hooks/metadata": resolve(mocksDir, "metadata.mock.tsx"),
  "./jobDataService": resolve(mocksDir, "jobDataService.mock.tsx"),
};
