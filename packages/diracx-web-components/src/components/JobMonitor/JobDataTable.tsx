"use client";

import React, { useCallback, useMemo, useState, Suspense } from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertColor,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import Delete from "@mui/icons-material/Delete";
import Clear from "@mui/icons-material/Clear";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { DataTable, ContextMenuItem } from "../shared/DataTable";
import type { ToolbarAction } from "../shared/DataTable/SplitActionButton";
import { Job, JobHistory, SearchBody } from "../../types";
import { useDiracxUrl } from "../../hooks/utils";
import { useJobMonitorContext } from "./JobMonitorContext";

import {
  deleteJobs,
  fetchMatchingJobIds,
  getJobHistory,
  getJobSandbox,
  getJobSandboxUrl,
  killJobs,
  useJobs,
} from "./jobDataService";

const LazyJobHistoryDialog = React.lazy(() =>
  import("./JobHistoryDialog").then((m) => ({ default: m.JobHistoryDialog })),
);

interface JobDataTableProps {
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** The function to call when the search body changes */
  setSearchBody: React.Dispatch<React.SetStateAction<SearchBody>>;
  /** Set pagination */
  setPagination: React.Dispatch<
    React.SetStateAction<import("@tanstack/react-table").PaginationState>
  >;
  /** Set row selection */
  setRowSelection: React.Dispatch<
    React.SetStateAction<import("@tanstack/react-table").RowSelectionState>
  >;
  /** Set column visibility */
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<import("@tanstack/react-table").VisibilityState>
  >;
  /** Set column pinning */
  setColumnPinning: React.Dispatch<
    React.SetStateAction<import("@tanstack/react-table").ColumnPinningState>
  >;
}

/**
 * The data grid for the jobs
 */
export function JobDataTable({
  searchBody,
  setSearchBody,
  setPagination,
  setRowSelection,
  setColumnVisibility,
  setColumnPinning,
}: JobDataTableProps) {
  const { state, columns, statusColors, mutateJobs } = useJobMonitorContext();
  const { pagination, rowSelection, columnVisibility, columnPinning } = state;

  // Authentication
  const { configuration } = useOIDCContext();
  const { accessToken, accessTokenPayload } = useOidcAccessToken(
    configuration?.scope,
  );

  const diracxUrl = useDiracxUrl();

  // State for loading elements
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State for selected job
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // State for job history
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [jobHistoryData, setJobHistoryData] = useState<JobHistory[]>([]);
  /**
   * Fetches the jobs from the /api/jobs/search endpoint
   */
  const {
    data: results,
    headers: dataHeader,
    error: dataError,
    isLoading,
  } = useJobs(
    diracxUrl,
    accessToken,
    searchBody,
    pagination.pageIndex,
    pagination.pageSize,
  );

  // Parse the headers to get the first item, last item and number of items
  const contentRange = dataHeader?.get("content-range");
  let totalJobs = 0;

  if (contentRange) {
    const match = contentRange.match(/jobs (\d+)-(\d+)\/(\d+)/);
    if (match) {
      totalJobs = parseInt(match[3]);
    }
  } else if (results) {
    totalJobs = results.length;
  }

  const clearSelected = useCallback(
    () => setRowSelection({}),
    [setRowSelection],
  );

  /**
   * Handle the deletion of jobs by IDs (called by SplitActionButton)
   */
  const handleDelete = useCallback(
    async (ids: (number | string)[]) => {
      setBackdropOpen(true);
      try {
        await deleteJobs(
          diracxUrl,
          ids.map(Number),
          accessToken,
          accessTokenPayload,
        );
        mutateJobs();
        clearSelected();
        setSnackbarInfo({
          open: true,
          message: "Deleted successfully",
          severity: "success",
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setSnackbarInfo({
          open: true,
          message: "Delete failed: " + errorMessage,
          severity: "error",
        });
      } finally {
        setBackdropOpen(false);
      }
    },
    [accessToken, accessTokenPayload, diracxUrl, clearSelected, mutateJobs],
  );

  /**
   * Handle the killing of jobs by IDs (called by SplitActionButton)
   */
  const handleKill = useCallback(
    async (ids: (number | string)[]) => {
      setBackdropOpen(true);
      try {
        const { data } = await killJobs(
          diracxUrl,
          ids.map(Number),
          accessToken,
          accessTokenPayload,
        );

        const failedJobs = Object.entries(data.failed).map(
          ([jobId, error]) => `Job ${jobId}: ${error.detail}`,
        );
        const areSucceedJobs = Object.keys(data.success).length > 0;

        mutateJobs();
        clearSelected();

        if (areSucceedJobs && failedJobs.length > 0) {
          setSnackbarInfo({
            open: true,
            message: `Kill: Failed: ${failedJobs.join("; ")}, Success for the rest`,
            severity: "warning",
          });
        } else if (areSucceedJobs) {
          setSnackbarInfo({
            open: true,
            message: "Kill: Success for all jobs.",
            severity: "success",
          });
        } else {
          setSnackbarInfo({
            open: true,
            message: "Kill: Failure for all jobs.",
            severity: "error",
          });
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setSnackbarInfo({
          open: true,
          message: "Kill failed: " + errorMessage,
          severity: "error",
        });
      } finally {
        setBackdropOpen(false);
      }
    },
    [accessToken, accessTokenPayload, diracxUrl, clearSelected, mutateJobs],
  );

  /**
   * Handle the history of the selected job
   */
  const handleHistory = useCallback(
    async (selectedId: string | null) => {
      if (!selectedId) return;
      const jobId = Number(selectedId);
      setBackdropOpen(true);
      setSelectedJobId(jobId);
      try {
        const { data } = await getJobHistory(diracxUrl, jobId, accessToken);
        setBackdropOpen(false);
        // Show the history
        setJobHistoryData(data);
        setIsHistoryDialogOpen(true);
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbarInfo({
          open: true,
          message: "Fetching history failed: " + errorMessage,
          severity: "error",
        });
      } finally {
        setBackdropOpen(false);
      }
    },
    [accessToken, diracxUrl],
  );

  const handleHistoryClose = () => {
    setIsHistoryDialogOpen(false);
  };

  const handleSandboxDownload = useCallback(
    async (selectedId: string | null, sbType: "input" | "output") => {
      if (!selectedId) return;
      const jobId = Number(selectedId);
      setBackdropOpen(true);
      try {
        const { data: sandboxData } = await getJobSandbox(
          diracxUrl,
          jobId,
          sbType,
          accessToken,
        );
        if (sandboxData.length === 0)
          throw new Error(`No ${sbType} sandbox found`);
        const pfn = sandboxData[0];
        if (pfn) {
          const { data: urlData } = await getJobSandboxUrl(
            diracxUrl,
            pfn,
            accessToken,
          );
          if (urlData?.url) {
            const link = document.createElement("a");
            link.href = urlData.url;
            link.download = `${sbType}-sandbox-${jobId}.tar.gz`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSnackbarInfo({
              open: true,
              message: `Downloading ${sbType} sandbox of ${jobId}...`,
              severity: "info",
            });
          } else
            throw new Error(
              "Could not retrieve a download URL for the sandbox",
            );
        } else throw new Error(`No ${sbType} sandbox found`);
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setSnackbarInfo({
          open: true,
          message: `Fetching sandbox of ${jobId} failed: ` + errorMessage,
          severity: "error",
        });
      } finally {
        setBackdropOpen(false);
      }
    },
    [accessToken, diracxUrl],
  );

  /**
   * The toolbar components for the data grid
   */
  const actions: ToolbarAction[] = useMemo(
    () => [
      {
        label: "Kill",
        icon: <Clear fontSize="small" />,
        onClick: handleKill,
        requiresConfirmation: true,
        confirmationMessage: (count: number) =>
          `Are you sure you want to kill ${count.toLocaleString()} jobs?`,
        "data-testid": "kill-jobs-button",
      },
      {
        label: "Delete",
        icon: <Delete fontSize="small" />,
        onClick: handleDelete,
        requiresConfirmation: true,
        confirmationMessage: (count: number) =>
          `Are you sure you want to delete ${count.toLocaleString()} jobs?`,
        "data-testid": "delete-jobs-button",
      },
    ],
    [handleKill, handleDelete],
  );

  /**
   * The menu items
   */
  const menuItems: ContextMenuItem[] = useMemo(
    () => [
      {
        label: "Get history",
        onClick: (id: string | null) => handleHistory(id),
        dataTestId: "get-history-button",
      },
      {
        label: "Download input sandbox",
        onClick: (id: string | null) => handleSandboxDownload(id, "input"),
        dataTestId: "download-input-sandbox-button",
      },
      {
        label: "Download output sandbox",
        onClick: (id: string | null) => handleSandboxDownload(id, "output"),
        dataTestId: "download-output-sandbox-button",
      },
    ],
    [handleHistory, handleSandboxDownload],
  );

  const fetchMatchingIds = useCallback(
    () => fetchMatchingJobIds(diracxUrl, accessToken, searchBody),
    [diracxUrl, accessToken, searchBody],
  );

  /**
   * Table instance
   */
  const table = useReactTable({
    data: useMemo(() => results || [], [results]),
    columns,
    state: {
      columnVisibility,
      columnPinning,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.JobID.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    enablePinning: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    manualPagination: true,
  });

  /**
   * The main component
   */
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <DataTable<Job>
        title="List of Jobs"
        table={table}
        totalRows={totalJobs}
        searchBody={searchBody}
        setSearchBody={setSearchBody}
        error={dataError}
        isLoading={isLoading}
        actions={actions}
        menuItems={menuItems}
        fetchMatchingIds={fetchMatchingIds}
      />
      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarInfo((old) => ({ ...old, open: false }))}
      >
        <Alert
          onClose={() => setSnackbarInfo((old) => ({ ...old, open: false }))}
          severity={snackbarInfo.severity as AlertColor}
          sx={{ width: "100%" }}
          role="alert"
        >
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Suspense fallback={null}>
        <LazyJobHistoryDialog
          open={isHistoryDialogOpen}
          onClose={handleHistoryClose}
          historyData={jobHistoryData}
          jobId={selectedJobId ?? 0}
          statusColors={statusColors}
        />
      </Suspense>
    </Box>
  );
}
