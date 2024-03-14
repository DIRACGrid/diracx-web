import * as React from "react";
import { useJobs } from "@/hooks/jobs";
import { DataTable, HeadCell } from "./DataTable";
import Box from "@mui/material/Box";
import {
  blue,
  orange,
  grey,
  green,
  red,
  lightBlue,
  purple,
  teal,
  blueGrey,
  lime,
  amber,
} from "@mui/material/colors";
import { useMediaQuery, useTheme } from "@mui/material";

const renderStatusCell = (status: string) => {
  const statusColors: { [key: string]: string } = {
    Submitting: purple[500], // Starting process - Purple suggests something 'in progress'
    Received: blueGrey[500], // Neutral informative color
    Checking: teal[500], // Indicates a process in action, teal is less 'active' than blue but still indicates movement
    Staging: lightBlue[500], // Light blue is calm, implying readiness and preparation
    Waiting: amber[600], // Amber signals a pause or that something is on hold
    Matched: blue[300], // A lighter blue indicating a successful match but still in an intermediate stage
    Running: blue[900], // Dark blue suggests a deeper level of operation
    Rescheduled: lime[700], // Lime is bright and eye-catching, good for something that has been reset
    Completing: orange[500], // Orange is often associated with the transition, appropriate for a state leading to completion
    Completed: green[300], // Light green signifies near success
    Done: green[500], // Green represents success and completion
    Failed: red[500], // Red is commonly associated with failure
    Stalled: amber[900], // Darker amber implies a more critical waiting or hold state
    Killed: red[900], // A darker red to indicate an intentional stop with a more critical connotation than 'Failed'
    Deleted: grey[500], // Grey denotes deactivation or removal, neutral and final
  };

  return (
    <Box
      sx={{
        display: "inline-block",
        borderRadius: "10px",
        padding: "3px 10px",
        backgroundColor: statusColors[status] || "default",
        color: "white",
        fontWeight: "bold",
      }}
    >
      {status}
    </Box>
  );
};

const headCells: HeadCell[] = [
  { id: "JobID", label: "Job ID" },
  { id: "JobName", label: "Job Name" },
  { id: "Status", label: "Status", render: renderStatusCell },
  {
    id: "MinorStatus",
    label: "Minor Status",
  },
  {
    id: "SubmissionTime",
    label: "Submission Time",
  },
];

const mobileHeadCells: HeadCell[] = [
  { id: "JobID", label: "Job ID" },
  { id: "JobName", label: "Job Name" },
  { id: "Status", label: "Status", render: renderStatusCell },
];

/**
 * The data grid for the jobs
 */
export function JobDataTable() {
  const { data: rows, isLoading, error } = useJobs();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const columns = isMobile ? mobileHeadCells : headCells;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching jobs</div>;
  if (!rows || rows.length === 0) return <div>No job submitted.</div>;

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowIdentifier="JobID"
      isMobile={isMobile}
    />
  );
}
