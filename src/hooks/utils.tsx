import { useEffect, useState } from "react";

export function useDiracxUrl() {
  const [diracxUrl, setDiracxUrl] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs on client side
    if (typeof window !== "undefined") {
      setDiracxUrl(
        (prevConfig) => `${window.location.protocol}//${window.location.host}`,
      );
    }
  }, []);

  return diracxUrl;
}
