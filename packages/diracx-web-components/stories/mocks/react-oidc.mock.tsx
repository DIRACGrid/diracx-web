import * as React from "react";

const jestFn =
  // Storybook runs in the browser – `jest` is not defined there
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof jest !== "undefined" ? jest.fn : (fn: any) => fn;

const noop = () => {};

/* ---------- API surface --------------------------------- */
export const useOidc = jestFn(() => ({ login: noop, isAuthenticated: false }));
export const useOidcAccessToken = jestFn(() => ({
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
