"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { useMUITheme } from "@/hooks/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import Dashboard from "@/components/layout/Dashboard";

export default function JobMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMUITheme();

  return (
    <section>
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
    </section>
  );
}
