"use client";

import { useState } from "react";

/**
 * Custom hook to get the diracx installation URL
 * @returns the diracx installation URL
 */
export function useDiracxUrl() {
  const [diracxUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    // Vite-based consumers (diracx-web) expose VITE_DIRACX_URL via
    // import.meta.env. Next.js-based consumers (packages/extensions) don't
    // populate import.meta.env at all, so it's optional here; they expose
    // the same value via process.env.NEXT_PUBLIC_DIRACX_URL instead.
    const envUrl =
      import.meta.env?.VITE_DIRACX_URL ||
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DIRACX_URL) ||
      undefined;
    return envUrl || `${window.location.protocol}//${window.location.host}`;
  });

  return diracxUrl;
}
