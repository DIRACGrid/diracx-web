"use client";
import { useEffect, useState } from "react";

/**
 * Fetcher function for useSWR
 * @param args - URL, access token, and method
 * @returns a promise
 */
export const fetcher = (args: [string, string?, string?]): Promise<any> => {
  const [url, accessToken, method = "GET"] = args;
  const headers = accessToken
    ? { Authorization: "Bearer " + accessToken }
    : undefined;

  return fetch(url, {
    method,
    ...(headers && { headers }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  });
};

/**
 * Custom hook to get the diracx installation URL
 * @returns the diracx installation URL
 */
export function useDiracxUrl() {
  const [diracxUrl, setDiracxUrl] = useState<string | null>(null);

  useEffect(() => {
    setDiracxUrl(`${window.location.protocol}//${window.location.host}`);
  }, []);

  return diracxUrl;
}
