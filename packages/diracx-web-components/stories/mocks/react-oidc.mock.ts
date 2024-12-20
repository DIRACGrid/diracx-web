import { fn } from "@storybook/test";
// Aliased the '@axa-fr/react-oidc' library as '@actual/react-oidc' in the Storybook config to prevent the mock from importing itself.
// @ts-expect-error: Cannot find module '@actual/react-oidc'
import * as actual from "@actual/react-oidc";

export const useOidc = fn(actual.useOidc);
export const useOidcAccessToken = fn(actual.useOidcAccessToken);
export const OidcProvider = actual.OidcProvider;
