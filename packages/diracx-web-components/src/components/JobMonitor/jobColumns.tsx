"use client";

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
  brown,
} from "@mui/material/colors";

import { lighten, darken, useTheme } from "@mui/material";

import { createColumnHelper } from "@tanstack/react-table";

import { Job, CategoryType } from "../../types";
import { JobColumnDef, useJobMonitorContext } from "./JobMonitorContext";

// Base status colors (used for column meta values and passed as props)
export const statusColors: Record<string, string> = {
  Submitting: purple[500],
  Received: blueGrey[500],
  Checking: teal[500],
  Staging: lightBlue[500],
  Waiting: amber[600],
  Matched: blue[300],
  Running: blue[900],
  Rescheduled: lime[700],
  Completing: orange[500],
  Completed: green[300],
  Done: green[500],
  Failed: red[500],
  Stalled: amber[900],
  Killed: red[900],
  Deleted: grey[500],
};

/**
 * Renders a status badge with theme-aware colors.
 */
function StatusCell({ status }: { status: string }) {
  const theme = useTheme();
  const { statusColors } = useJobMonitorContext();
  const baseColor = statusColors[status] ?? brown[500];
  const bg =
    theme.palette.mode === "light"
      ? darken(baseColor, 0.1)
      : lighten(baseColor, 0.1);

  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: "10px",
        padding: "1px 8px",
        fontSize: "0.75rem",
        backgroundColor: bg,
        color: "white",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
}

const columnHelper = createColumnHelper<Job>();

/**
 * The column definitions for the Job Monitor data grid.
 */
export const jobColumns: JobColumnDef[] = [
  columnHelper.accessor("JobID", {
    id: "JobID",
    header: "ID",
    meta: { type: CategoryType.NUMBER, isQuasiUnique: true },
  }),
  columnHelper.accessor("Status", {
    id: "Status",
    header: "Status",
    cell: (info) => <StatusCell status={info.getValue()} />,
    meta: {
      type: CategoryType.STRING,
      values: Object.keys(statusColors).sort(),
      isQuasiUnique: false,
    },
  }),
  columnHelper.accessor("MinorStatus", {
    id: "MinorStatus",
    header: "Minor Status",
  }),
  columnHelper.accessor("ApplicationStatus", {
    id: "ApplicationStatus",
    header: "Application Status",
  }),
  columnHelper.accessor("Site", {
    id: "Site",
    header: "Site",
  }),
  columnHelper.accessor("JobName", {
    id: "JobName",
    header: "Name",
  }),
  columnHelper.accessor("JobGroup", {
    id: "JobGroup",
    header: "Job Group",
  }),
  columnHelper.accessor("JobType", {
    id: "JobType",
    header: "Type",
  }),
  columnHelper.accessor("LastUpdateTime", {
    id: "LastUpdateTime",
    header: "Last Update Time",
    meta: { type: CategoryType.DATE, isQuasiUnique: true },
  }),
  columnHelper.accessor("HeartBeatTime", {
    id: "HeartBeatTime",
    header: "Last Sign of Life",
    meta: { type: CategoryType.DATE, isQuasiUnique: true },
  }),
  columnHelper.accessor("SubmissionTime", {
    id: "SubmissionTime",
    header: "Submission Time",
    meta: { type: CategoryType.DATE, isQuasiUnique: true },
  }),
  columnHelper.accessor("Owner", {
    id: "Owner",
    header: "Owner",
  }),
  columnHelper.accessor("OwnerGroup", {
    id: "OwnerGroup",
    header: "Owner Group",
  }),
  columnHelper.accessor("VO", {
    id: "VO",
    header: "VO",
  }),
  columnHelper.accessor("StartExecTime", {
    id: "StartExecTime",
    header: "Start Execution Time",
    meta: { type: CategoryType.DATE, isQuasiUnique: true },
  }),
  columnHelper.accessor("EndExecTime", {
    id: "EndExecTime",
    header: "End Execution Time",
    meta: { type: CategoryType.DATE, isQuasiUnique: true },
  }),
  columnHelper.accessor("UserPriority", {
    id: "UserPriority",
    header: "User Priority",
    meta: { type: CategoryType.NUMBER },
  }),
  columnHelper.accessor("RescheduleCounter", {
    id: "RescheduleCounter",
    header: "Reschedule Counter",
    meta: { type: CategoryType.NUMBER },
  }),
];

/**
 * Converts a human-readable job attribute name to its internal name.
 * @param name - The human-readable name of the job attribute
 * @param columns - The array of column definitions
 * @returns The corresponding internal name of the job attribute
 */
export function fromHumanReadableText(
  name: string,
  columns: JobColumnDef[],
): string {
  const index = columns.findIndex((column) => column.header === name);
  if (index !== -1) {
    return columns[index].id || name;
  }
  return name;
}

/**
 * This function validates and converts the state of the application
 * It ensure that the state is in the correct format
 * even if the structure changed between versions
 *
 * @param state - The state of the application
 * @returns The parsed state of the application and a boolean indicating if the state was converted
 * @throws Error if the state is not valid
 */
export function validateAndConvertState(state: string): [string, boolean] {
  let parsed;
  let isValid = true;
  try {
    parsed = JSON.parse(state);
    isValid =
      typeof parsed === "object" &&
      typeof parsed.columnVisibility === "object" &&
      typeof parsed.columnPinning === "object" &&
      typeof parsed.rowSelection === "object" &&
      typeof parsed.pagination === "object" &&
      "pageIndex" in parsed.pagination &&
      "pageSize" in parsed.pagination &&
      typeof parsed.filters === "object";

    if (isValid) return [state, false];
  } catch (e) {
    isValid = false;
    if (e instanceof SyntaxError) {
      throw new Error("The state is not a valid JSON");
    }
  }

  const newState = {
    filters: [],
    columnVisibility: parsed.columnVisibility,
    columnPinning: parsed.columnPinning,
    rowSelection: parsed.rowSelection,
    pagination: parsed.pagination,
  };

  return [JSON.stringify(newState), true];
}
