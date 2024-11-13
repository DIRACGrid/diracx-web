import path from "path";
import { fileURLToPath } from "url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    transpilePackages: ["@dirac-grid/diracx-web-components"],
    ...(isDev && {
      webpack: (config) => {
        config.resolve.alias["@dirac-grid/diracx-web-components"] =
          path.resolve(__dirname, "../diracx-web-components/src");
        return config;
      },
    }),
    output: "export",
    images: {
      unoptimized: true,
    },
  };
};
