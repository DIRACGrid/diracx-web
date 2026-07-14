"use client";

export interface FetcherOptions {
  url: string;
  accessToken?: string;
  method?: string;
  body?: unknown;
  /** Optional signal to abort the request (e.g. on effect cleanup) */
  signal?: AbortSignal;
}

/**
 * Generic HTTP client for DiracX API calls.
 * @param options - Named parameters for the request
 * @returns a promise resolving to the response headers and parsed data
 */
export async function fetcher<T>(
  options: FetcherOptions,
): Promise<{ headers: Headers; data: T }> {
  const { url, accessToken, method = "GET", body, signal } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: "Bearer " + accessToken }),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    // The body can only be consumed once, so read it as text first and then
    // try to parse JSON out of it. Servers behind a proxy frequently return a
    // non-JSON error body (HTML or plain text); reading text() up front keeps
    // that fallback working — calling text() after a failed json() would throw
    // "body already read" and mask the real error.
    let errorMessage = `HTTP ${response.status}`;
    const raw = await response.text();
    if (raw) {
      try {
        const errorJson = JSON.parse(raw);
        errorMessage += errorJson?.detail
          ? `: ${errorJson.detail}`
          : `: ${JSON.stringify(errorJson)}`;
      } catch {
        // Not JSON — surface the raw text.
        errorMessage += `: ${raw}`;
      }
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
