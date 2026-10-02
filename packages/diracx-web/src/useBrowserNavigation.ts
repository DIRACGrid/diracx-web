import { useCallback, useEffect, useState } from "react";

/**
 * Replaces Next.js's usePathname/useRouter/useSearchParams with a plain
 * History API-backed equivalent, matching the getPath/setPath/getSearchParams
 * contract expected by DiracXWebProviders.
 */
export function useBrowserNavigation() {
  const [location, setLocation] = useState(
    () => window.location.pathname + window.location.search,
  );

  useEffect(() => {
    const onPopState = () =>
      setLocation(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const getPath = useCallback(() => location.split("?")[0], [location]);

  const getSearchParams = useCallback(
    () => new URLSearchParams(location.split("?")[1] ?? ""),
    [location],
  );

  const setPath = useCallback((path: string) => {
    // Accepts either a bare path ("/auth") or a path with a query string
    // ("/?appId=example"), matching how DiracXWebProviders consumers call it.
    window.history.pushState({}, "", path);
    setLocation(window.location.pathname + window.location.search);
  }, []);

  return { getPath, setPath, getSearchParams };
}
