"use client";
import { useEffect, useState } from "react";

/**
 * Fetcher function for useSWR
 * @param args - URL, access token, body and method
 * @returns a promise
 */
export const fetcher = (
  args: [string, string?, string?, any?],
): Promise<any> => {
  const [url, accessToken, method = "GET", body] = args;
  const headers = {
    "Content-Type": "application/json", // Always set this when sending JSON body
    ...(accessToken && { Authorization: "Bearer " + accessToken }),
  };

  return fetch(url, {
    method: method,
    headers: headers,
    ...(body && { body: JSON.stringify(body) }),
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
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
