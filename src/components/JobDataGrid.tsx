"use client";
import { DataGrid } from "@mui/x-data-grid";
import { useJobs } from "@/hooks/jobs";

const columns = [
  { field: "JobID", headerName: "Job ID", width: 70 },
  { field: "JobName", headerName: "Job Name", width: 130 },
  { field: "Status", headerName: "Status", width: 130 },
  { field: "MinorStatus", headerName: "Minor Status", width: 130 },
  { field: "SubmissionTime", headerName: "Submission Time", width: 130 },
];

/**
 * Table of jobs
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
      pageSizeOptions={[5, 10, 50, 100, 500, 1000]}
      checkboxSelection
    />
  );
}
