"use client";
import { OidcProvider } from "@axa-fr/react-oidc";
import React, { useEffect } from "react";
import { useOIDCContext } from "@/hooks/oidcConfiguration";
import { useDiracxUrl } from "@/hooks/utils";

interface OIDCProviderProps {
  children: React.ReactNode;
}

/**
 * Wrapper around the react-oidc OidcProvider component
 * Needed because OidcProvider cannot be directly called from a server file
 * @param props - configuration of the OIDC provider
 * @returns the wrapper around OidcProvider
 */
export function OIDCProvider(props: OIDCProviderProps) {
  const { configuration, setConfiguration } = useOIDCContext();
  const diracxUrl = useDiracxUrl();

  useEffect(() => {
    if (!configuration && diracxUrl) {
      // Get the OIDC configuration name from the session storage if it exists
      let scope = sessionStorage.getItem("oidcScope") || ``;

      if (scope) {
        scope = scope.replace(/^"|"$/g, "");
      }

      // Set the OIDC configuration
      setConfiguration({
        authority: diracxUrl,
        client_id: "myDIRACClientID",
        scope: scope,
        redirect_uri: `${diracxUrl}/#authentication-callback`,
      });
    }
  }, [diracxUrl, configuration, setConfiguration]);

  const withCustomHistory = () => {
    return {
      replaceState: (url: string) => {
        // Cannot use router.replace() because the code is not adapted to NextJS 13 yet
        window.location.href = url;
      },
    };
  };

  if (!configuration) {
    // Handle the case where configuration is still being determined
    return <main>Loading OIDC Configuration...</main>;
  }
  // Configure the OidcProvider
  return (
    <>
      <OidcProvider
        configuration={configuration}
        configurationName={configuration.scope}
        withCustomHistory={withCustomHistory}
      >
        <main>{props.children}</main>
      </OidcProvider>
    </>
  );
}
