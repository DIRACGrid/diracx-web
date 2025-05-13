"use client";

import { Box } from "@mui/material";
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
