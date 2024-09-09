import React from "react";
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
import {
  Alert,
  AlertColor,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Backdrop,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Delete, Clear, Replay } from "@mui/icons-material";
import { Filter } from "@/types/Filter";
import { Column } from "@/types/Column";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { DataTable, MenuItem } from "../shared/DataTable";
import { JobHistoryDialog } from "./JobHistoryDialog";
import {
  deleteJobs,
  getJobHistory,
  killJobs,
  refreshJobs,
  rescheduleJobs,
  useJobs,
} from "./JobDataService";

const statusColors: { [key: string]: string } = {
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
 * Renders the status cell with colors
 */
const renderStatusCell = (status: string) => {
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

/**
 * The head cells for the data grid (desktop version)
 */
const headCells: Column[] = [
  { id: "JobID", label: "Job ID", type: "number" },
  { id: "JobName", label: "Job Name" },
  { id: "Site", label: "Site" },
  {
    id: "Status",
    label: "Status",
    render: renderStatusCell,
    type: Object.keys(statusColors).sort(),
  },
  {
    id: "MinorStatus",
    label: "Minor Status",
  },
  {
    id: "SubmissionTime",
    label: "Submission Time",
    type: "DateTime",
  },
];

/**
 * The head cells for the data grid (mobile version)
 */
const mobileHeadCells: Column[] = [
  { id: "JobID", label: "Job ID" },
  { id: "JobName", label: "Job Name" },
  { id: "Status", label: "Status", render: renderStatusCell },
];

type Order = "asc" | "desc";

/**
 * The data grid for the jobs
 */
export function JobDataTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selected, setSelected] = React.useState<readonly number[]>([]);

  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [snackbarInfo, setSnackbarInfo] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  // State for sorting
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<string | number>("JobID");
  // State for pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  // State for filters
  const [filters, setFilters] = React.useState<Filter[]>([]);
  // State for search body
  const [searchBody, setSearchBody] = React.useState({});
  // State for job history
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);
  const [jobHistoryData, setJobHistoryData] = React.useState([]);

  /**
   * Fetches the jobs from the /api/jobs/search endpoint
   */
  const { data, error, isLoading, isValidating } = useJobs(
    accessToken,
    searchBody,
    page,
    rowsPerPage,
  );

  const dataHeader = data?.headers;
  const results = data?.data;

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

  const columns = isMobile ? mobileHeadCells : headCells;
  const clearSelected = () => setSelected([]);

  /**
   * Handle the deletion of the selected jobs
   */
  const handleDelete = async (selectedIds: readonly number[]) => {
    setBackdropOpen(true);
    try {
      await deleteJobs(selectedIds, accessToken);
      setBackdropOpen(false);
      refreshJobs(accessToken, searchBody, page, rowsPerPage);
      clearSelected();
      setSnackbarInfo({
        open: true,
        message: "Deleted successfully",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbarInfo({
        open: true,
        message: "Delete failed: " + error.message,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  };

  /**
   * Handle the killing of the selected jobs
   */
  const handleKill = async (selectedIds: readonly number[]) => {
    setBackdropOpen(true);
    try {
      await killJobs(selectedIds, accessToken);
      setBackdropOpen(false);
      refreshJobs(accessToken, searchBody, page, rowsPerPage);
      clearSelected();
      setSnackbarInfo({
        open: true,
        message: "Killed successfully",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbarInfo({
        open: true,
        message: "Kill failed: " + error.message,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  };

  /**
   * Handle the rescheduling of the selected jobs
   */
  const handleReschedule = async (selectedIds: readonly number[]) => {
    setBackdropOpen(true);
    try {
      await rescheduleJobs(selectedIds, accessToken);
      setBackdropOpen(false);
      refreshJobs(accessToken, searchBody, page, rowsPerPage);
      clearSelected();
      setSnackbarInfo({
        open: true,
        message: "Rescheduled successfully",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbarInfo({
        open: true,
        message: "Reschedule failed: " + error.message,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  };

  /**
   * Handle the history of the selected job
   */
  const handleHistory = async (selectedId: number | null) => {
    if (!selectedId) return;
    setBackdropOpen(true);
    try {
      const { data } = await getJobHistory(selectedId, accessToken);
      setBackdropOpen(false);
      // Show the history
      setJobHistoryData(data[selectedId]);
      setIsHistoryDialogOpen(true);
    } catch (error: any) {
      setSnackbarInfo({
        open: true,
        message: "Fetching history failed: " + error.message,
        severity: "error",
      });
    } finally {
      setBackdropOpen(false);
    }
  };

  const handleHistoryClose = () => {
    setIsHistoryDialogOpen(false);
  };

  /**
   * The toolbar components for the data grid
   */
  const toolbarComponents = (
    <>
      <Tooltip title="Reschedule">
        <IconButton onClick={() => handleReschedule(selected)}>
          <Replay />
        </IconButton>
      </Tooltip>
      <Tooltip title="Kill">
        <IconButton onClick={() => handleKill(selected)}>
          <Clear />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={() => handleDelete(selected)}>
          <Delete />
        </IconButton>
      </Tooltip>
    </>
  );

  /**
   * The menu items
   */
  const menuItems: MenuItem[] = [
    { label: "Get history", onClick: (id: number | null) => handleHistory(id) },
  ];

  /**
   * The main component
   */

  return (
    <>
      <DataTable
        title="List of Jobs"
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        order={order}
        setOrder={setOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        totalRows={totalJobs}
        selected={selected}
        setSelected={setSelected}
        filters={filters}
        setFilters={setFilters}
        setSearchBody={setSearchBody}
        columns={columns}
        rows={results}
        error={error}
        isLoading={isLoading}
        isValidating={isValidating}
        rowIdentifier="JobID"
        isMobile={isMobile}
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
      />
    </>
  );
}
