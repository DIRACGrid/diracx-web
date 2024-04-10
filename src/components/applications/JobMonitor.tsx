"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { useMUITheme } from "@/hooks/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { JobDataTable } from "../ui/JobDataTable";
import Dashboard from "../layout/Dashboard";

/**
 * Build the Job Monitor application
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  const theme = useMUITheme();

  return (
    <Dashboard>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            ml: "5%",
            mr: "5%",
          }}
        >
          <h2>Job Monitor</h2>
          <JobDataTable />
        </Box>
      </MUIThemeProvider>
    </Dashboard>
  );
}
