import { fn } from "@storybook/test";
// @ts-ignore: Cannot find module '@actual/react-oidc'
import * as actual from "@actual/react-oidc";

export const useOidc = fn(actual.useOidc);
export const useOidcAccessToken = fn(actual.useOidcAccessToken);
export const OidcProvider = actual.OidcProvider;
