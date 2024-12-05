import { useMemo, useCallback, useContext } from "react";
import { NavigationContext } from "@/contexts/NavigationProvider";

/**
 * Custom hook for managing search parameters in the URL.
 * Provides functions to get, set, and remove search parameters.
 *
 * @returns An object containing the `getParam`, `setParam`, and `removeParam` functions.
 */
export function useSearchParamsUtils() {
  const { getPath, setPath, getSearchParams } = useContext(NavigationContext);
  const searchParams = useMemo(() => getSearchParams(), [getSearchParams]);
  const pathname = useMemo(() => getPath(), [getPath]);

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
        setPath(`${pathname}?${params.toString()}`);
      } else {
        params.set(key, value);
        params.sort();
        setPath(`${pathname}?${params.toString()}`);
      }
    },
    [getParams, pathname, setPath],
  );

  const removeParam = useCallback(
    (key: string) => {
      const params = getParams();
      params.delete(key);

      setPath(
        `${pathname}?${params.toString() === "" ? "" : params.toString()}`,
      );
    },
    [getParams, pathname, setPath],
  );

  return { getParam, setParam, removeParam, getAllParam };
}
