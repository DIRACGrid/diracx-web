"use client";

import { useState } from "react";

/**
 * Custom hook to get the diracx installation URL
 * @returns the diracx installation URL
 */
export function useDiracxUrl() {
  const [diracxUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      process.env.NEXT_PUBLIC_DIRACX_URL ||
      `${window.location.protocol}//${window.location.host}`
    );
  });

  return diracxUrl;
}
