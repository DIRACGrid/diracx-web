"use client";
import { DataGrid } from "@mui/x-data-grid";
import { useJobs } from "@/hooks/jobs";

const columns = [
  { field: "JobID", headerName: "Job ID", width: 90 },
  { field: "JobName", headerName: "Job Name", flex: 1 },
  { field: "Status", headerName: "Status", flex: 1 },
  { field: "MinorStatus", headerName: "Minor Status", flex: 1 },
  { field: "SubmissionTime", headerName: "Submission Time", flex: 1 },
];

/**
 * It gets rows from diracx and build the data grid
 *
 * @returns a DataGrid displaying details about jobs
 */
export function JobDataGrid() {
  const { data, error, isLoading } = useJobs();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>An error occurred while fetching jobs.</div>;
  }

  if (!data || data.length === 0) {
    return <div>No job submitted.</div>;
  }

  return (
    <DataGrid
      getRowId={(row) => row.JobID}
      rows={data}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 5 },
        },
      }}
      autoHeight
      pageSizeOptions={[5, 10, 50, 100, 500, 1000]}
      checkboxSelection
    />
  );
}
