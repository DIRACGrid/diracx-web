import { fetcher } from "../src/services/client";

/**
 * A minimal Response stub whose body can only be consumed once, matching the
 * WHATWG fetch contract (calling json()/text() twice throws). This is what
 * lets the "non-JSON error body" test below catch the double-read regression.
 */
function mockResponse(init: {
  ok?: boolean;
  status?: number;
  jsonBody?: unknown;
  textBody?: string;
}): Response {
  const { ok = true, status = 200, jsonBody, textBody } = init;
  const bodyText =
    textBody ?? (jsonBody !== undefined ? JSON.stringify(jsonBody) : "");
  let consumed = false;
  const consume = () => {
    if (consumed) {
      throw new TypeError("Body is unusable: body has already been read");
    }
    consumed = true;
  };
  return {
    ok,
    status,
    headers: {} as Headers,
    json: async () => {
      consume();
      return JSON.parse(bodyText);
    },
    text: async () => {
      consume();
      return bodyText;
    },
  } as unknown as Response;
}

function mockFetch(response: Response) {
  global.fetch = jest
    .fn()
    .mockResolvedValue(response) as unknown as typeof fetch;
}

describe("services/client fetcher", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("parses JSON success responses", async () => {
    mockFetch(mockResponse({ jsonBody: { hello: "world" } }));
    const { data } = await fetcher<{ hello: string }>({ url: "/api" });
    expect(data).toEqual({ hello: "world" });
  });

  it("returns empty data for 204 responses without touching the body", async () => {
    mockFetch(mockResponse({ status: 204, textBody: "" }));
    const { data } = await fetcher({ url: "/api" });
    expect(data).toEqual({});
  });

  it("surfaces the JSON `detail` field on error responses", async () => {
    mockFetch(
      mockResponse({
        ok: false,
        status: 400,
        jsonBody: { detail: "bad input" },
      }),
    );
    await expect(fetcher({ url: "/api" })).rejects.toThrow(
      "HTTP 400: bad input",
    );
  });

  it("falls back to the raw text for non-JSON error bodies", async () => {
    // Regression: reading text() after a failed json() used to throw
    // "body already read" and mask the real HTTP error.
    mockFetch(
      mockResponse({
        ok: false,
        status: 502,
        textBody: "<html>Bad Gateway</html>",
      }),
    );
    await expect(fetcher({ url: "/api" })).rejects.toThrow(
      "HTTP 502: <html>Bad Gateway</html>",
    );
  });

  it("sends the bearer token and JSON body when provided", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(mockResponse({ jsonBody: {} }));
    global.fetch = fetchMock as unknown as typeof fetch;
    await fetcher({
      url: "/api",
      accessToken: "tok",
      method: "POST",
      body: { a: 1 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });
});
