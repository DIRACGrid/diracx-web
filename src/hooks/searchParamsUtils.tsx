import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook for managing search parameters in the URL.
 * Provides functions to get, set, and remove search parameters.
 *
 * @returns An object containing the `getParam`, `setParam`, and `removeParam` functions.
 */
export function useSearchParamsUtils() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getParams = useCallback(() => {
    return searchParams.entries();
  }, [searchParams]);

  const buildQueryString = useCallback((params: Record<string, string>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.set(key, value);
    });
    return query.toString();
  }, []);

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = Object.fromEntries(getParams());
      router.push(
        `${pathname}?${buildQueryString({
          ...params,
          [key]: value,
        })}`,
      );
    },
    [buildQueryString, getParams, pathname, router],
  );

  const removeParam = useCallback(
    (key: string) => {
      const { [key]: _, ...rest } = Object.fromEntries(getParams());

      router.push(
        `${pathname}?${buildQueryString({
          ...rest,
        })}`,
      );
    },
    [buildQueryString, getParams, pathname, router],
  );

  return { getParam, setParam, removeParam };
}
