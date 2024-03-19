import * as React from "react";
import { DataTable, HeadCell, Filter } from "./DataTable";
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
} from "@mui/material";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import ReplayIcon from "@mui/icons-material/Replay";
import { Backdrop, CircularProgress, Snackbar } from "@mui/material";
import { mutate } from "swr";
import useSWR from "swr";
import { fetcher } from "../../hooks/utils";

/**
 * Renders the status cell with colors
 */
const renderStatusCell = (status: string) => {
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

/**
 * The head cells for the data grid (mobile version)
 */
const mobileHeadCells: HeadCell[] = [
  { id: "JobID", label: "Job ID" },
  { id: "JobName", label: "Job Name" },
  { id: "Status", label: "Status", render: renderStatusCell },
];

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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [filters, setFilters] = React.useState<Filter[]>([]);
  const [searchBody, setSearchBody] = React.useState({});

  /**
   * Fetches the jobs from the /api/jobs/search endpoint
   */
  //TODO: uncomment the following line once page and per_page are used in the backend
  //const urlGetJobs = `/api/jobs/search?page=${page}&per_page=${rowsPerPage}`;
  const urlGetJobs = `/api/jobs/search?page=0&per_page=100`;
  const { data, error } = useSWR(
    [urlGetJobs, accessToken, "POST", searchBody],
    fetcher,
  );

  if (!data && !error) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching jobs</div>;
  if (!data || data.length === 0) return <div>No job submitted.</div>;

  const columns = isMobile ? mobileHeadCells : headCells;
  const clearSelected = () => setSelected([]);

  /**
   * Handle the application of filters
   */
  const handleApplyFilters = () => {
    // Transform list of filters into a json objects
    const jsonFilters = filters.map((filter) => ({
      parameter: filter.column,
      operator: filter.operator,
      value: filter.value,
    }));
    setSearchBody({ search: jsonFilters });
  };

  /**
   * Handle the deletion of the selected jobs
   */
  const handleDelete = async (selectedIds: readonly number[]) => {
    const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
    const deleteUrl = `/api/jobs/?${queryString}`;
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Use the access token for authorization
      },
    };

    setBackdropOpen(true);
    try {
      const response = await fetch(deleteUrl, requestOptions);
      if (!response.ok)
        throw new Error("An error occurred while deleting jobs.");
      const data = await response.json();
      setBackdropOpen(false);
      mutate([urlGetJobs, accessToken, "POST", searchBody]);
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
    const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
    const killUrl = `/api/jobs/kill?${queryString}`;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Use the access token for authorization
      },
    };

    setBackdropOpen(true);
    try {
      const response = await fetch(killUrl, requestOptions);
      if (!response.ok)
        throw new Error("An error occurred while deleting jobs.");
      const data = await response.json();
      setBackdropOpen(false);
      mutate([urlGetJobs, accessToken, "POST", searchBody]);
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
    const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
    const rescheduleUrl = `/api/jobs/reschedule?${queryString}`;
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Use the access token for authorization
      },
    };

    setBackdropOpen(true);
    try {
      const response = await fetch(rescheduleUrl, requestOptions);
      if (!response.ok)
        throw new Error("An error occurred while deleting jobs.");
      const data = await response.json();
      setBackdropOpen(false);
      mutate([urlGetJobs, accessToken, "POST", searchBody]);
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
   * The toolbar components for the data grid
   */
  const toolbarComponents = (
    <>
      <Tooltip title="Reschedule">
        <IconButton onClick={() => handleReschedule(selected)}>
          <ReplayIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Kill">
        <IconButton onClick={() => handleKill(selected)}>
          <ClearIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={() => handleDelete(selected)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <>
      <DataTable
        title="List of Jobs"
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        selected={selected}
        setSelected={setSelected}
        filters={filters}
        setFilters={setFilters}
        handleApplyFilters={handleApplyFilters}
        columns={columns}
        rows={data}
        rowIdentifier="JobID"
        isMobile={isMobile}
        toolbarComponents={toolbarComponents}
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
    </>
  );
}
