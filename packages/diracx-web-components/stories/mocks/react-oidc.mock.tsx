import React from "react";

const mockFn =
  // Storybook runs in the browser – `vi` is not defined there
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof vi !== "undefined" ? vi.fn : (fn: any) => fn;

const noop = () => {};

/* ---------- API surface --------------------------------- */
export const useOidc = mockFn(() => ({ login: noop, isAuthenticated: false }));
export const useOidcAccessToken = mockFn(() => ({
  accessToken: "123456789",
  accessTokenPayload: {
    preferred_username: "John Doe",
    vo: "dirac",
    dirac_group: "dirac_user",
    dirac_properties: ["NormalUser", "AnotherProperty"],
  },
}));

export const OidcProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div data-testid="mock-oidc-provider">{children}</div>;
/* -------------------------------------------------------- */
