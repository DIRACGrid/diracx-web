"use client";
import { Box } from "@mui/material";
import { JobDataTable } from "./JobDataTable";

/**
 * Build the Job Monitor application
 *
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <JobDataTable />
    </Box>
  );
}
