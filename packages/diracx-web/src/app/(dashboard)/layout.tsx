"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { OIDCSecure, Dashboard } from "diracx-web-components/components";
import { ApplicationsProvider } from "diracx-web-components/contexts";
import { useMUITheme } from "diracx-web-components/hooks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMUITheme();

  return (
    <section>
      <ApplicationsProvider>
        <OIDCSecure>
          <Dashboard>
            <MUIThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                sx={{
                  ml: "5%",
                  mr: "5%",
                }}
              >
                {children}
              </Box>
            </MUIThemeProvider>
          </Dashboard>
        </OIDCSecure>
      </ApplicationsProvider>
    </section>
  );
}
