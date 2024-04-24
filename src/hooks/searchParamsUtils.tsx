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
    return new URLSearchParams(searchParams);
  }, [searchParams]);

  const getAllParam = useCallback(
    (key: string) => {
      return searchParams.getAll(key);
    },
    [searchParams],
  );

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const setParam = useCallback(
    (key: string, value: string | string[]) => {
      const params = getParams();
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
        params.sort();
        router.push(`${pathname}?${params.toString()}`);
      } else {
        params.set(key, value);
        params.sort();
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [getParams, pathname, router],
  );

  const removeParam = useCallback(
    (key: string) => {
      const params = getParams();
      params.delete(key);

      router.push(
        `${pathname}?${params.toString() === "" ? "" : params.toString()}`,
      );
    },
    [getParams, pathname, router],
  );

  return { getParam, setParam, removeParam, getAllParam };
}
