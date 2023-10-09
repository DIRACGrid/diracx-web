"use client";
import {
  OidcConfiguration,
  OidcProvider,
  OidcSecure,
} from "@axa-fr/react-oidc";
import React, { useState, useEffect } from "react";
import { useDiracxUrl } from "@/hooks/utils";

interface OIDCProviderProps {
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
  const diracxUrl = useDiracxUrl();
  const [configuration, setConfiguration] = useState<OidcConfiguration | null>(
    null,
  );

  useEffect(() => {
    if (diracxUrl !== null) {
      setConfiguration((prevConfig) => ({
        authority: diracxUrl,
        // TODO: Figure out how to get this. Hardcode? Get from a /.well-known/diracx-configuration endpoint?
        client_id: "myDIRACClientID",
        // TODO: Get this from the /.well-known/openid-configuration endpoint
        scope: "vo:diracAdmin",
        redirect_uri: `${diracxUrl}/#authentication-callback`,
      }));
    }
  }, [diracxUrl]);

  if (configuration === null) {
    return <></>;
  }

  return (
    <>
      <OidcProvider
        configuration={configuration}
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
