"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { useMUITheme } from "@/hooks/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useOidcAccessToken } from "@axa-fr/react-oidc";

/**
 * Build the User Dashboard page
 * @returns User Dashboard content
 */
export default function UserDashboard() {
  const theme = useMUITheme();
  const { accessTokenPayload } = useOidcAccessToken();

  return (
    <React.Fragment>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            ml: "5%",
            mr: "5%",
          }}
        >
          <h2>Hello {accessTokenPayload["preferred_username"]}</h2>

          <p>To start with, select an application in the side bar</p>
        </Box>
      </MUIThemeProvider>
    </React.Fragment>
  );
}
