"use client";
import * as React from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "@/hooks/oidcConfiguration";
import ApplicationHeader from "@/components/ui/ApplicationHeader";

/**
 * Build the User Dashboard page
 * @returns User Dashboard content
 */
export default function UserDashboard() {
  const { configuration } = useOIDCContext();
  const { accessTokenPayload } = useOidcAccessToken(configuration?.scope);

  if (!accessTokenPayload) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <ApplicationHeader type="Dashboard" />
      <h2>Hello {accessTokenPayload["preferred_username"]}</h2>

      <p>To start with, select an application in the side bar</p>
    </div>
  );
}
