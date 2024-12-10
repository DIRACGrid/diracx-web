"use client";
import React from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "@dirac-grid/diracx-web-components/hooks";
import { Box } from "@mui/material";

/**
 * Build a Test page
 * @returns the example component
 */
export default function UserDashboard() {
  // Get info from the auth token
  const { configuration } = useOIDCContext();
  const { accessTokenPayload } = useOidcAccessToken(configuration?.scope);

  if (!accessTokenPayload) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h2>Hello {accessTokenPayload["preferred_username"]}👋</h2>
      <Box>
        <p>This is a test application</p>
      </Box>
    </div>
  );
}
