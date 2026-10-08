import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const componentsSrc = fileURLToPath(
  new URL("../diracx-web-components/src", import.meta.url),
);

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    // diracx-web-components' package.json "exports" map only points at its
    // built dist/, which the in-cluster dev-mode deployment never builds
    // (diracx-charts' developer-mode init container only runs `npm ci`, no
    // build step). Next.js never hit this because transpilePackages
    // transpiled the package's source directly, bypassing dist/ entirely;
    // Vite has no equivalent, so alias each subpath to source in dev mode.
    // Each subpath needs its own entry (a bare-package alias wouldn't match
    // these more specific specifiers).
    ...(command === "serve" && {
      alias: {
        "@dirac-grid/diracx-web-components/components": path.join(
          componentsSrc,
          "components",
        ),
        "@dirac-grid/diracx-web-components/contexts": path.join(
          componentsSrc,
          "contexts",
        ),
        "@dirac-grid/diracx-web-components/hooks": path.join(
          componentsSrc,
          "hooks",
        ),
        "@dirac-grid/diracx-web-components/types": path.join(
          componentsSrc,
          "types",
        ),
        "@dirac-grid/diracx-web-components/services": path.join(
          componentsSrc,
          "services",
        ),
        "@dirac-grid/diracx-web-components": componentsSrc,
      },
    }),
  },
  server: {
    // In-cluster dev mode (diracx-charts' developer.enabled mount) sets
    // PORT=8080 to match the pod's declared containerPort/Service/probes,
    // the same way Next.js's dev server used to read it. Outside the
    // cluster (standalone dev mode), fall back to 3000, matching Next's own
    // previous default and the diracx backend's hardcoded CORS allowlist of
    // http(s)://localhost:3000/:8000 (see
    // diracx-routers/src/diracx/routers/factory.py) for local dev.
    port: Number(process.env.PORT) || 3000,
    // Next's dev server binds all interfaces by default; Vite's defaults to
    // localhost only. Match Next's behavior, since this also needs to be
    // reachable from outside the container when run in-cluster (e.g. the
    // kubelet readiness probe connects from outside the pod's loopback).
    host: true,
    // Vite's DNS-rebinding protection rejects requests whose Host header
    // isn't in an explicit allowlist; Next's dev server never had this
    // restriction. The demo generates a hostname dynamically per machine
    // (<ip>.nip.io), so there's no fixed value to allowlist — disable the
    // check to match Next's prior behavior.
    allowedHosts: true,
  },
}));
