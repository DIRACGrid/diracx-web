"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertColor,
  IconButton,
  Tooltip,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Delete, Clear, Replay } from "@mui/icons-material";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  ColumnPinningState,
  RowSelectionState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { DataTable, MenuItem } from "../shared/DataTable";
import { Job, JobHistory, SearchBody } from "../../types";
import { useDiracxUrl } from "../../hooks/utils";
import { JobHistoryDialog } from "./JobHistoryDialog";

import {
  deleteJobs,
  getJobHistory,
  getJobSandbox,
  getJobSandboxUrl,
  killJobs,
  refreshJobs,
  rescheduleJobs,
  useJobs,
} from "./JobDataService";

/**
 * Job Data Table props
 * @property {number} searchBody - the search body to send along with the request
 * @property {function} setSearchBody - the function to call when the search body changes
 */
interface JobDataTableProps {
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** The function to call when the search body changes */
  setSearchBody: React.Dispatch<React.SetStateAction<SearchBody>>;
  /** Columns */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[];
  /** Pagination */
  pagination: PaginationState;
  /** Set pagination */
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  /** Row selection */
  rowSelection: RowSelectionState;
  /** Set row selection */
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  /** Column Visibility */
  columnVisibility: VisibilityState;
  /** Set column visibility */
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  /** Column Pinning */
  columnPinning: ColumnPinningState;
  /** Set column pinning */
  setColumnPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>;
  /** Status Colors */
  statusColors: Record<string, string>;
}

/**
 * The data grid for the jobs
 */
export function JobDataTable({
  searchBody,
  setSearchBody,
  columns,
  pagination,
  setPagination,
  rowSelection,
  setRowSelection,
  columnVisibility,
  setColumnVisibility,
  columnPinning,
  setColumnPinning,
  statusColors,
}: JobDataTableProps) {
  // Authentication
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);

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
  const { data, error, isLoading, isValidating } = useJobs(
    diracxUrl,
    accessToken,
    searchBody,
    pagination.pageIndex,
    pagination.pageSize,
  );

  const dataHeader = data?.headers;
  const results = useMemo(() => data?.data || [], [data?.data]);

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

  const clearSelected = () => setRowSelection({});

  /**
   * Handle the deletion of the selected jobs
   */
  const handleDelete = useCallback(async () => {
    setBackdropOpen(true);
    try {
      const selectedIds = Object.keys(rowSelection).map(Number);
      await deleteJobs(diracxUrl, selectedIds, accessToken);
      setBackdropOpen(false);
      refreshJobs(
        diracxUrl,
        accessToken,
        searchBody,
        pagination.pageIndex,
        pagination.pageSize,
      );
      clearSelected();
      setSnackbarInfo({
        open: true,
        message: "Deleted successfully",
        severity: "success",
      });
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbarInfo({
        open: true,
        message: "Delete failed: " + errorMessage,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  }, [
    accessToken,
    diracxUrl,
    rowSelection,
    searchBody,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  /**
   * Handle the killing of the selected jobs
   */
  const handleKill = useCallback(async () => {
    setBackdropOpen(true);
    try {
      const selectedIds = Object.keys(rowSelection).map(Number);
      const { data } = await killJobs(diracxUrl, selectedIds, accessToken);

      const failedJobs = Object.entries(data.failed).map(
        ([jobId, error]) => `Job ${jobId}: ${error.detail}`,
      );
      const successfulJobs = Object.keys(data.success).map(
        (jobId) => `Job ${jobId}`,
      );

      setBackdropOpen(false);
      refreshJobs(
        diracxUrl,
        accessToken,
        searchBody,
        pagination.pageIndex,
        pagination.pageSize,
      );
      clearSelected();
      // Handle Snackbar Messaging
      if (successfulJobs.length > 0 && failedJobs.length > 0) {
        setSnackbarInfo({
          open: true,
          message: `Kill operation summary. Success: ${successfulJobs.join(", ")}. Failed: ${failedJobs.join("; ")}`,
          severity: "warning",
        });
      } else if (successfulJobs.length > 0) {
        setSnackbarInfo({
          open: true,
          message: `Kill operation summary. Success: ${successfulJobs.join(", ")}`,
          severity: "success",
        });
      } else {
        setSnackbarInfo({
          open: true,
          message: `Kill operation summary. Failed: ${failedJobs.join("; ")}`,
          severity: "error",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbarInfo({
        open: true,
        message: "Kill operation failed: " + errorMessage,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  }, [
    accessToken,
    diracxUrl,
    rowSelection,
    searchBody,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  /**
   * Handle the rescheduling of the selected jobs
   */
  const handleReschedule = useCallback(async () => {
    setBackdropOpen(true);
    try {
      const selectedIds = Object.keys(rowSelection).map(Number);
      const { data } = await rescheduleJobs(
        diracxUrl,
        selectedIds,
        accessToken,
      );

      const failedJobs = Object.entries(data.failed).map(
        ([jobId, error]) => `Job ${jobId}: ${error.detail}`,
      );
      const successfulJobs = Object.keys(data.success).map(
        (jobId) => `Job ${jobId}`,
      );

      setBackdropOpen(false);
      refreshJobs(
        diracxUrl,
        accessToken,
        searchBody,
        pagination.pageIndex,
        pagination.pageSize,
      );
      clearSelected();
      // Handle Snackbar Messaging
      if (successfulJobs.length > 0 && failedJobs.length > 0) {
        setSnackbarInfo({
          open: true,
          message: `Reschedule operation summary. Success: ${successfulJobs.join(", ")}. Failed: ${failedJobs.join("; ")}`,
          severity: "warning",
        });
      } else if (successfulJobs.length > 0) {
        setSnackbarInfo({
          open: true,
          message: `Reschedule operation summary. Success: ${successfulJobs.join(", ")}`,
          severity: "success",
        });
      } else {
        setSnackbarInfo({
          open: true,
          message: `Reschedule operation summary. Failed: ${failedJobs.join("; ")}`,
          severity: "error",
        });
      }
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setSnackbarInfo({
        open: true,
        message: "Reschedule operation failed: " + errorMessage,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  }, [
    accessToken,
    diracxUrl,
    rowSelection,
    searchBody,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  /**
   * Handle the history of the selected job
   */
  const handleHistory = useCallback(
    async (selectedId: number | null) => {
      if (!selectedId) return;
      setBackdropOpen(true);
      setSelectedJobId(selectedId);
      try {
        const { data } = await getJobHistory(
          diracxUrl,
          selectedId,
          accessToken,
        );
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

  const handleSandboxDownload = async (
    jobId: number | null,
    sbType: "input" | "output",
  ) => {
    if (!jobId) return;
    setBackdropOpen(true);
    try {
      const { data } = await getJobSandbox(
        diracxUrl,
        jobId,
        sbType,
        accessToken,
      );
      if (!data) throw new Error(`No sandbox found`);
      const pfn = data[0];
      setBackdropOpen(false);
      if (pfn) {
        const { data } = await getJobSandboxUrl(diracxUrl, pfn, accessToken);
        if (data?.url) {
          const link = document.createElement("a");
          link.href = data.url;
          link.download = `${sbType}-sandbox-${jobId}.tar.gz`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setSnackbarInfo({
            open: true,
            message: `Downloading ${sbType} sandbox of ${jobId}...`,
            severity: "info",
          });
        } else throw new Error(`Could not fetch the sandbox from ${data.url}`);
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
  };

  /**
   * The toolbar components for the data grid
   */
  const toolbarComponents = useMemo(
    () => (
      <>
        <Tooltip title="Reschedule">
          <IconButton onClick={() => handleReschedule()}>
            <Replay />
          </IconButton>
        </Tooltip>
        <Tooltip title="Kill">
          <IconButton onClick={() => handleKill()}>
            <Clear />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => handleDelete()}>
            <Delete data-testid="delete-jobs-button" />
          </IconButton>
        </Tooltip>
      </>
    ),
    [handleReschedule, handleKill, handleDelete],
  );

  /**
   * The menu items
   */
  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Get history",
        onClick: (id: number | null) => handleHistory(id),
        dataTestId: "get-history-button",
      },
      {
        label: "Download input sandbox",
        onClick: (id: number | null) => handleSandboxDownload(id, "input"),
        dataTestId: "download-input-sandbox-button",
      },
      {
        label: "Download output sandbox",
        onClick: (id: number | null) => handleSandboxDownload(id, "output"),
        dataTestId: "download-output-sandbox-button",
      },
    ],
    [handleHistory],
  );

  /**
   * Table instance
   */
  const table = useReactTable({
    data: results,
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
        error={error}
        isLoading={isLoading}
        isValidating={isValidating}
        toolbarComponents={toolbarComponents}
        menuItems={menuItems}
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
      <JobHistoryDialog
        open={isHistoryDialogOpen}
        onClose={handleHistoryClose}
        historyData={jobHistoryData}
        jobId={selectedJobId ?? 0}
        statusColors={statusColors}
      />
    </Box>
  );
}
