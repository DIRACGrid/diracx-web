"use client";
import React from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "@/hooks/oidcConfiguration";
import ApplicationHeader from "@/components/shared/ApplicationHeader";

/**
 * Build the User Dashboard page
 * @param headerSize - The size of the header, optional
 * @returns User Dashboard content
 */
export default function UserDashboard({
  headerSize,
}: {
  headerSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  const { configuration } = useOIDCContext();
  const { accessTokenPayload } = useOidcAccessToken(configuration?.scope);

  if (!accessTokenPayload) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <ApplicationHeader type="Dashboard" size={headerSize} />
      <h2>Hello {accessTokenPayload["preferred_username"]}</h2>

      <p>To start with, select an application in the side bar</p>
    </div>
  );
}
