"use client";

import React, { useEffect, useContext } from "react";
import { useOidc } from "@axa-fr/react-oidc";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { NavigationContext } from "../../contexts/NavigationProvider";

interface OIDCProps {
  children: React.ReactNode;
}

/**
 * Check whether the user is authenticated, and redirect to the login page if not
 * @param props - configuration of the OIDC provider
 * @returns The children if the user is authenticated, null otherwise
 */
export function OIDCSecure({ children }: OIDCProps) {
  const { configuration } = useOIDCContext();
  const { isAuthenticated } = useOidc(configuration?.scope);
  const { setPath } = useContext(NavigationContext);

  useEffect(() => {
    // Redirect to login page if not authenticated
    if (!isAuthenticated) {
      setPath(
        "/auth?" +
          // URLSearchParams to ensure that auth redirects users to the URL they came from
          new URLSearchParams({
            redirect: window.location.pathname + window.location.search,
          }).toString(),
      );
    }
  }, [isAuthenticated, setPath]);

  return <>{children}</>;
}
