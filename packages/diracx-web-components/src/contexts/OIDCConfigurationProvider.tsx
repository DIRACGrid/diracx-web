"use client";

import React, { useState, createContext } from "react";
import { OidcConfiguration } from "@axa-fr/react-oidc";
import { OIDCProvider } from "@/components/layout/OIDCProvider";

/**
 * OIDC configuration context
 * @property configuration - the OIDC configuration
 * @property setConfiguration - function to set the OIDC configuration
 * @returns the OIDC configuration context
 */
export const OIDCConfigurationContext = createContext<{
  configuration: OidcConfiguration | null;
  setConfiguration: (config: OidcConfiguration | null) => void;
}>({
  configuration: null,
  setConfiguration: () => {},
});

/**
 * OIDC configuration provider
 * @param children - the children of the provider
 * @returns the OIDC configuration provider
 */
export const OIDCConfigurationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [configuration, setConfiguration] = useState<OidcConfiguration | null>(
    null,
  );

  return (
    <OIDCConfigurationContext.Provider
      value={{
        configuration,
        setConfiguration,
      }}
    >
      <OIDCProvider>{children}</OIDCProvider>
    </OIDCConfigurationContext.Provider>
  );
};
