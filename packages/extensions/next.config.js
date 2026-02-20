import path from "path";
import { fileURLToPath } from "url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsSrc = path.resolve(__dirname, "../diracx-web-components/src");

export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    transpilePackages: ["@dirac-grid/diracx-web-components"],
    ...(isDev && {
      webpack: (config) => {
        // In dev mode, resolve diracx-web-components imports to source
        // files for HMR. Each subpath must be aliased explicitly because
        // webpack 5 resolves package exports before resolve.alias.
        config.resolve.alias["@dirac-grid/diracx-web-components/components"] =
          path.join(componentsSrc, "components");
        config.resolve.alias["@dirac-grid/diracx-web-components/contexts"] =
          path.join(componentsSrc, "contexts");
        config.resolve.alias["@dirac-grid/diracx-web-components/hooks"] =
          path.join(componentsSrc, "hooks");
        config.resolve.alias["@dirac-grid/diracx-web-components/types"] =
          path.join(componentsSrc, "types");
        config.resolve.alias["@dirac-grid/diracx-web-components"] =
          componentsSrc;
        return config;
      },
    }),
    output: "export",
    images: {
      unoptimized: true,
    },
  };
};
