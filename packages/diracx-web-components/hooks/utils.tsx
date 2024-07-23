"use client";
import { useEffect, useState } from "react";

/**
 * Fetcher function for useSWR
 * @param args - URL, access token, body and method
 * @returns a promise
 */
export const fetcher = async (
  args: [string, string?, string?, any?],
): Promise<{ headers: Headers; data: any }> => {
  const [url, accessToken, method = "GET", body] = args;
  const headers = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: "Bearer " + accessToken }),
  };

  const response = await fetch(url, {
    method: method,
    headers: headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) throw new Error("Failed to fetch data");

  const data = await response.json();
  const responseHeaders = response.headers;

  return { headers: responseHeaders, data };
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
