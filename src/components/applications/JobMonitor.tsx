"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { JobDataTable } from "../ui/JobDataTable";
import Dashboard from "../layout/Dashboard";
import { useMUITheme } from "@/hooks/theme";

/**
 * Build the Job Monitor application
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  const theme = useMUITheme();

  return (
    <div>
      <h2>Job Monitor</h2>
      <JobDataTable />
    </div>
  );
}
