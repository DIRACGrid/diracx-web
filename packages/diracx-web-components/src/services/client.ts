"use client";

export interface FetcherOptions {
  url: string;
  accessToken?: string;
  method?: string;
  body?: unknown;
}

/**
 * Generic HTTP client for DiracX API calls.
 * @param options - Named parameters for the request
 * @returns a promise resolving to the response headers and parsed data
 */
export async function fetcher<T>(
  options: FetcherOptions,
): Promise<{ headers: Headers; data: T }> {
  const { url, accessToken, method = "GET", body } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: "Bearer " + accessToken }),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // Try to parse a more specific error message
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.detail) {
        errorMessage += `: ${errorJson.detail}`;
      } else {
        errorMessage += `: ${JSON.stringify(errorJson)}`;
      }
    } catch {
      // fallback if the server doesn't return JSON
      const text = await response.text();
      errorMessage += `: ${text}`;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    // No content response, return empty data
    return { headers: response.headers, data: {} as T };
  }

  const data = (await response.json()) as T;

  return { headers: response.headers, data };
}
