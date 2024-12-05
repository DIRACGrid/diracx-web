import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import React, { useMemo } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { JobHistory } from "@/types/JobHistory";

interface JobHistoryDialogProps {
  /** Whether the Dialog is open */
  open: boolean;
  /** The function to close the dialog */
  onClose: () => void;
  /** The data for the job history dialog */
  historyData: JobHistory[];
  /** The job ID */
  jobId: number;
}

/**
 * Renders a dialog component that displays the job history.
 *
 * @returns The rendered JobHistoryDialog component.
 */
export function JobHistoryDialog({
  open,
  onClose,
  historyData,
  jobId,
}: JobHistoryDialogProps) {
  const theme = useTheme();

  // Create column helper
  const columnHelper = createColumnHelper<JobHistory>();

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("Status", {
        header: "Status",
      }),
      columnHelper.accessor("MinorStatus", {
        header: "Minor Status",
      }),
      columnHelper.accessor("ApplicationStatus", {
        header: "Application Status",
      }),
      columnHelper.accessor("StatusTime", {
        header: "Status Time",
      }),
      columnHelper.accessor("Source", {
        header: "Source",
      }),
    ],
    [columnHelper],
  );

  // Create table instance
  const table = useReactTable({
    data: historyData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
    enableColumnResizing: true, // Enable column resizing
    columnResizeMode: "onChange", // Column resize mode
  });

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="job-history-title">
      <DialogTitle id="job-history-title">Job History: {jobId}</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ padding: 0 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={{
                        position: "relative",
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                height: "100%",
                                width: "5px",
                                cursor: "col-resize",
                                zIndex: 1,
                              }}
                            />
                          )}
                        </>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
