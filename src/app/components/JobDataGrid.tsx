"use client";
import { DataGrid } from "@mui/x-data-grid";

/**
 * Table of jobs
 * @param props  - rows and columns to display
 * @returns a DataGrid displaying details about jobs
 */
export function JobDataGrid(props) {
  return (
    <DataGrid
      rows={props.rows}
      columns={props.columns}
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
