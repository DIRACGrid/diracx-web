"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMUITheme } from "@/hooks/theme";
import Dashboard from "@/components/layout/Dashboard";
import ApplicationsProvider from "@/contexts/ApplicationsProvider";
import { OIDCSecure } from "@/components/layout/OIDCSecure";

export default function JobMonitorLayout({
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
