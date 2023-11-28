import { useContext } from "react";
import { OIDCConfigurationContext } from "@/contexts/OIDCConfigurationProvider";

/**
 * Hook to use the OIDC configuration context
 * @returns the OIDC configuration context
 */
export const useOIDCContext = () => {
  const context = useContext(OIDCConfigurationContext);
  if (!context) {
    throw new Error(
      "useOIDCConfigurationContext must be used within an OIDCConfigurationProvider",
    );
  }
  return context;
};
