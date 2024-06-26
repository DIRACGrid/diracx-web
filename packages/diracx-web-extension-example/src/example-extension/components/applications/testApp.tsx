"use client";
import * as React from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { ApplicationHeader } from "diracx-web-components/components";
import { useOIDCContext } from "diracx-web-components/hooks";
import { Box } from "@mui/material";

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
      <ApplicationHeader type="Test App" size="h5" />
      <h2>Hello {accessTokenPayload["preferred_username"]}👋</h2>
      <Box>
        <p>This is a test application</p>
      </Box>
    </div>
  );
}
