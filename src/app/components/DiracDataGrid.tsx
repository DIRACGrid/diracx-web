'use client'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export function DiracDataGrid(props) {
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
};