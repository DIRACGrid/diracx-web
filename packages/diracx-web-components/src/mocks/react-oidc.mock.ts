import { fn } from "@storybook/test";
import * as actual from "@actual/react-oidc";

export const useOidc = fn(actual.useOidc);
export const useOidcAccessToken = fn(actual.useOidcAccessToken);
export const OidcProvider = actual.OidcProvider;
