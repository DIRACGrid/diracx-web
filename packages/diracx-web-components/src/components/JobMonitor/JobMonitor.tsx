"use client";
import React, {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useEffect,
  Suspense,
} from "react";

import { Box, Paper, Skeleton } from "@mui/material";

import { mutate } from "swr";
import { useApplicationId } from "../../hooks/application";
import { Filter } from "../../types/Filter";
import { SearchBody } from "../../types";
import { useDiracxUrl } from "../../hooks";
import { JobDataTable } from "./JobDataTable";
import { JobSearchBar } from "./JobSearchBar";
const LazyJobPieChart = React.lazy(() =>
  import("./JobPieChart").then((m) => ({ default: m.JobPieChart })),
);
import { getSearchJobUrl } from "./jobDataService";
import { JobMonitorContext, jobMonitorReducer } from "./JobMonitorContext";
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
  const diracxUrl = useDiracxUrl();

  const [state, dispatch] = useReducer(
    jobMonitorReducer,
    appId,
    loadInitialState,
  );

  useJobMonitorPersistence(appId, state);

  const { filters, searchBody, pagination } = state;

  // Handle the application of filters
  const handleApplyFilters = useCallback(() => {
    dispatch({
      type: "APPLY_FILTERS",
      columns: jobColumns,
      fromHumanReadableText,
    });
  }, []);

  // Store current values in refs so the callback identity stays stable
  const searchBodyRef = useRef(searchBody);
  const paginationRef = useRef(pagination);
  useEffect(() => {
    searchBodyRef.current = searchBody;
  }, [searchBody]);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const mutateJobs = useCallback(() => {
    const p = paginationRef.current;
    // Revalidate the job table data
    mutate([
      getSearchJobUrl(diracxUrl, p.pageIndex, p.pageSize),
      searchBodyRef.current,
    ]);
    // Revalidate all job summary entries (pie chart) regardless of grouping
    mutate(
      (key) =>
        Array.isArray(key) &&
        typeof key[0] === "string" &&
        key[0].includes("/api/jobs/summary"),
    );
  }, [diracxUrl]);

  // Dispatcher-based setters for children that need React.Dispatch-compatible callbacks
  const setFilters = useCallback(
    (payload: Filter[] | ((prev: Filter[]) => Filter[])) =>
      dispatch({ type: "SET_FILTERS", payload }),
    [],
  );
  const setSearchBody = useCallback(
    (payload: SearchBody | ((prev: SearchBody) => SearchBody)) =>
      dispatch({ type: "SET_SEARCH_BODY", payload }),
    [],
  );
  const setColumnVisibility = useCallback(
    (
      payload:
        | import("@tanstack/react-table").VisibilityState
        | ((
            prev: import("@tanstack/react-table").VisibilityState,
          ) => import("@tanstack/react-table").VisibilityState),
    ) => dispatch({ type: "SET_COLUMN_VISIBILITY", payload }),
    [],
  );
  const setColumnPinning = useCallback(
    (
      payload:
        | import("@tanstack/react-table").ColumnPinningState
        | ((
            prev: import("@tanstack/react-table").ColumnPinningState,
          ) => import("@tanstack/react-table").ColumnPinningState),
    ) => dispatch({ type: "SET_COLUMN_PINNING", payload }),
    [],
  );
  const setRowSelection = useCallback(
    (
      payload:
        | import("@tanstack/react-table").RowSelectionState
        | ((
            prev: import("@tanstack/react-table").RowSelectionState,
          ) => import("@tanstack/react-table").RowSelectionState),
    ) => dispatch({ type: "SET_ROW_SELECTION", payload }),
    [],
  );
  const setPagination = useCallback(
    (
      payload:
        | import("@tanstack/react-table").PaginationState
        | ((
            prev: import("@tanstack/react-table").PaginationState,
          ) => import("@tanstack/react-table").PaginationState),
    ) => dispatch({ type: "SET_PAGINATION", payload }),
    [],
  );

  const contextValue = useMemo(
    () => ({ state, dispatch, columns: jobColumns, statusColors, mutateJobs }),
    [state, dispatch, mutateJobs],
  );

  return (
    <JobMonitorContext value={contextValue}>
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
            <JobDataTable
              searchBody={searchBody}
              setSearchBody={setSearchBody}
              setPagination={setPagination}
              setRowSelection={setRowSelection}
              setColumnVisibility={setColumnVisibility}
              setColumnPinning={setColumnPinning}
            />
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
    </JobMonitorContext>
  );
}
