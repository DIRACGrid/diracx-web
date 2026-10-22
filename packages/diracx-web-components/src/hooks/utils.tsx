"use client";

import { useState } from "react";

/**
 * Custom hook to get the diracx installation URL
 * @returns the diracx installation URL
 */
export function useDiracxUrl() {
  const [diracxUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    // TEMPORARY: this package is built targeting es6 (see tsup.config.ts),
    // which has no equivalent for import.meta, so esbuild strips
    // import.meta.env entirely at build time. Vite-based consumers
    // (diracx-web) must resolve import.meta.env.VITE_DIRACX_URL themselves
    // and set window.__DIRACX_URL__ before rendering, instead of this hook
    // reading it directly. Next.js-based consumers (packages/extensions)
    // still expose it via process.env directly. Remove this workaround once
    // this package's test suite moves off Jest (which can't run
    // import.meta.env) and reads import.meta.env.VITE_DIRACX_URL here
    // directly instead.
    const envUrl =
      window.__DIRACX_URL__ ||
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DIRACX_URL) ||
      undefined;
    return envUrl || `${window.location.protocol}//${window.location.host}`;
  });

  return diracxUrl;
}
