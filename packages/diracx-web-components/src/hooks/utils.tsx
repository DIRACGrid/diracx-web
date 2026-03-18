"use client";

import { useState } from "react";

/**
 * Custom hook to get the diracx installation URL
 * @returns the diracx installation URL
 */
export function useDiracxUrl() {
  const [diracxUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    // `process` only exists under Next.js (or another bundler that injects
    // it); guard the access so plain browser bundles don't throw.
    const envUrl =
      typeof process !== "undefined" && process.env
        ? process.env.NEXT_PUBLIC_DIRACX_URL
        : undefined;
    return envUrl || `${window.location.protocol}//${window.location.host}`;
  });

  return diracxUrl;
}
