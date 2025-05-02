"use client";

import { Box } from "@mui/material";
import { ApplicationState } from "../../types/ApplicationMetadata";
import { useApplicationId } from "../../hooks/application";
import { JobDataTable } from "./JobDataTable";
/**
 * Build the Job Monitor application
 *
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  const appId = useApplicationId();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      {/* The key is used to force a re-render of the component when the appId changes */}
      <JobDataTable key={appId} />
    </Box>
  );
}

export function exportState(appId: string): ApplicationState {
  const state = sessionStorage.getItem(`${appId}_State`);
  return state ? state : "null";
}

export function setState(appId: string, state: ApplicationState) {
  // Set the state in local storage
  sessionStorage.setItem(`${appId}_State`, state);
}
