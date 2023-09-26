"use client";
import { DataGrid } from "@mui/x-data-grid";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import useSWR from "swr";

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
  const { accessToken } = useOidcAccessToken();

  // TODO: move fetcher to make it usable from other places
  const fetcher = (params) => {
    const [path] = params;
    return fetch(process.env.NEXT_PUBLIC_DIRACX_URL + path, {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
    }).then((res) => res.json());
  };
  const { data, error } = useSWR(["/jobs/search?page=0&per_page=100"], fetcher);

  if (error) {
    return <div>An error occurred while fetching jobs.</div>;
  }

  if (!data) {
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
