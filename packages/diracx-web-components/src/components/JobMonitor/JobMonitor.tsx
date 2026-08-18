"use client";
import React, { useCallback, useMemo, useReducer, Suspense } from "react";

import { Box, Paper, Skeleton } from "@mui/material";

import { mutate } from "swr";
import { useApplicationId } from "../../hooks/application";
import { Filter } from "../../types/Filter";
import { JobDataTable } from "./JobDataTable";
import { JobSearchBar } from "./JobSearchBar";
const LazyJobPieChart = React.lazy(() =>
  import("./JobPieChart").then((m) => ({ default: m.JobPieChart })),
);
import {
  JobMonitorApiContext,
  JobMonitorStateContext,
  jobMonitorReducer,
} from "./JobMonitorContext";
import { jobColumns, statusColors, fromHumanReadableText } from "./jobColumns";
import {
  loadInitialState,
  useJobMonitorPersistence,
} from "./useJobMonitorPersistence";

// Static sx props extracted to avoid new object references on every render
const rootSx = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflow: "hidden",
  maxWidth: "100%",
} as const;

const contentSx = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  flexGrow: 1,
  overflow: "hidden",
  minWidth: 0,
} as const;

const tableSx = {
  flexGrow: 1,
  minWidth: 0,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
} as const;

const pieChartPaperSx = {
  width: { md: 340 },
  flexShrink: 0,
  alignSelf: { xs: "stretch", md: "flex-start" },
  m: 1,
  borderRadius: 2,
  boxSizing: "border-box",
  overflow: "hidden",
} as const;

/**
 * Build the Job Monitor application
 *
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  const appId = useApplicationId();

  const [state, dispatch] = useReducer(
    jobMonitorReducer,
    appId,
    loadInitialState,
  );

  useJobMonitorPersistence(appId, state);

  const { filters, searchBody } = state;

  // Handle the application of filters
  const handleApplyFilters = useCallback(() => {
    dispatch({
      type: "APPLY_FILTERS",
      columns: jobColumns,
      fromHumanReadableText,
    });
  }, []);

  const mutateJobs = useCallback(() => {
    // Revalidate all job table entries regardless of page/columns
    mutate(
      (key) =>
        Array.isArray(key) &&
        typeof key[0] === "string" &&
        key[0].includes("/api/jobs/search"),
    );
    // Revalidate all job summary entries (pie chart) regardless of grouping
    mutate(
      (key) =>
        Array.isArray(key) &&
        typeof key[0] === "string" &&
        key[0].includes("/api/jobs/summary"),
    );
  }, []);

  // Dispatcher-based setter for children that need a React.Dispatch-compatible callback
  const setFilters = useCallback(
    (payload: Filter[] | ((prev: Filter[]) => Filter[])) =>
      dispatch({ type: "SET_FILTERS", payload }),
    [],
  );

  // Stable API surface: everything here keeps its identity across state
  // changes (dispatch from useReducer, module-level constants, and a
  // mutateJobs with no reactive dependencies).
  const apiValue = useMemo(
    () => ({ dispatch, columns: jobColumns, statusColors, mutateJobs }),
    [mutateJobs],
  );

  return (
    <JobMonitorApiContext value={apiValue}>
      <JobMonitorStateContext value={state}>
        <Box sx={rootSx}>
          <JobSearchBar
            filters={filters}
            setFilters={setFilters}
            searchBody={searchBody}
            handleApplyFilters={handleApplyFilters}
          />

          <Box sx={contentSx}>
            {/* Table section */}
            <Box sx={tableSx}>
              <JobDataTable />
            </Box>

            {/* Pie chart card */}
            <Paper elevation={2} sx={pieChartPaperSx}>
              <Suspense
                fallback={<Skeleton variant="rectangular" height={200} />}
              >
                <LazyJobPieChart
                  searchBody={searchBody}
                  setFilters={setFilters}
                />
              </Suspense>
            </Paper>
          </Box>
        </Box>
      </JobMonitorStateContext>
    </JobMonitorApiContext>
  );
}
