"use client";
import {
  OidcConfiguration,
  OidcProvider,
  OidcSecure,
} from "@axa-fr/react-oidc";
import React from "react";

interface OIDCProviderProps {
  configuration: OidcConfiguration;
  children: React.ReactNode;
}

interface OIDCProps {
  children: React.ReactNode;
}

/**
 * Wrapper around the react-oidc OidcProvider component
 * Needed because OidcProvider cannot be directly called from a server file
 * @param props - configuration of the OIDC provider
 * @returns the wrapper around OidcProvider
 */
export function OIDCProvider(props: OIDCProviderProps) {
  const withCustomHistory = () => {
    return {
      replaceState: (url: string) => {
        // Cannot use router.replace() because the code is not adapted to NextJS 13 yet
        window.location.href = url;
      },
    };
  };

  return (
    <>
      <OidcProvider
        configuration={props.configuration}
        withCustomHistory={withCustomHistory}
      >
        <main>{props.children}</main>
      </OidcProvider>
    </>
  );
}

/**
 * Wrapper around the react-oidc OidcSecure component
 * Needed because OidcProvider cannot be directly called from a server file
 * @param props - configuration of the OIDC provider
 * @returns the wrapper around OidcProvider
 */
export function OIDCSecure({ children }: OIDCProps) {
  return (
    <>
      <OidcSecure>{children}</OidcSecure>
    </>
  );
}
