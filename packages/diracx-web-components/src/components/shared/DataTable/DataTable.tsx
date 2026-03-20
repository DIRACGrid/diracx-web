"use client";
import React, { useCallback, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import {
  Alert,
  Menu,
  MenuItem as MuiMenuItem,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Column,
  flexRender,
  Row,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchBody } from "../../../types";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableHeader } from "./DataTableHeader";
import type { ToolbarAction } from "./SplitActionButton";

// Static styles for virtualized row cells
const checkboxCellStyle: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
};

const unpinnedCellStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const paddingCellStyle: React.CSSProperties = {
  padding: 0,
  border: "none",
};

const tableRowSx = { cursor: "context-menu" } as const;

/**
 * Context menu item for the data table
 */
export interface ContextMenuItem {
  label: string;
  onClick: (id: string | null) => void;
  dataTestId?: string;
}

/**
 * Data table props
 */
export interface DataTableProps<T extends Record<string, unknown>> {
  /** The title of the table */
  title: string;
  /** The table */
  table: TanstackTable<T>;
  /** The total number of rows */
  totalRows: number;
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** Function to set the search body */
  setSearchBody: React.Dispatch<React.SetStateAction<SearchBody>>;
  /** The error or null if no error */
  error: Error | null;
  /** Whether the table is loading */
  isLoading: boolean;
  /** The components to display in the toolbar */
  toolbarComponents?: React.ReactElement;
  /** Toolbar actions rendered as split buttons (e.g. Kill, Delete) */
  actions?: ToolbarAction[];
  /** The context menu items */
  menuItems?: ContextMenuItem[];
  /** Callback to fetch all IDs matching current filters (enables bulk operations) */
  fetchMatchingIds?: () => Promise<(number | string)[]>;
  /** Boolean to disable the checkbox */
  disableCheckbox?: boolean;
  /** Whether to hide the footer */
  hideFooter?: boolean;
}

/**
 * Data table component
 *
 * @returns a DataTable component
 */
export function DataTable<T extends Record<string, unknown>>({
  title,
  table,
  totalRows,
  searchBody,
  setSearchBody,
  error,
  isLoading,
  toolbarComponents,
  actions,
  menuItems,
  fetchMatchingIds,
  disableCheckbox = false,
  hideFooter = false,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const checkboxWidth = disableCheckbox ? 0 : 50;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number | null;
    mouseY: number | null;
    id: string | null;
  }>({ mouseX: null, mouseY: null, id: null });

  // Sorting
  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: string) => {
      const isAsc =
        searchBody.sort &&
        searchBody.sort[0]?.parameter === property &&
        searchBody.sort[0]?.direction === "asc";
      setSearchBody((prevState: SearchBody) => ({
        ...prevState,
        sort: [{ parameter: property, direction: isAsc ? "desc" : "asc" }],
      }));
    },
    [searchBody, setSearchBody],
  );

  // Pagination
  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      table.setPageIndex(newPage);
    },
    [table],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.setPageSize(Number(event.target.value));
      table.setPageIndex(0);
    },
    [table],
  );

  // Context menu
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        id,
      });
    },
    [],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ mouseX: null, mouseY: null, id: null });
  }, []);

  const getLeftOffsetForColumn = useCallback(
    (column: Column<T, unknown>): number => {
      const pinnedColumns = table.getLeftLeafColumns();

      let offset = checkboxWidth;

      for (const col of pinnedColumns) {
        if (col.id === column.id) break;
        offset += col.getSize();
      }
      return offset;
    },
    [table, checkboxWidth],
  );

  const checkboxCellWithWidth = useMemo<React.CSSProperties>(
    () => ({ ...checkboxCellStyle, width: checkboxWidth }),
    [checkboxWidth],
  );

  const itemContent = useCallback(
    (_index: number, row: Row<T>) => (
      <>
        {!disableCheckbox && (
          <TableCell
            padding="checkbox"
            style={checkboxCellWithWidth}
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              size="small"
              name={`select-row-${row.id}`}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </TableCell>
        )}
        {row.getVisibleCells().map((cell) => {
          const isPinned = cell.column.getIsPinned();
          const style: React.CSSProperties = isPinned
            ? {
                ...unpinnedCellStyle,
                position: "sticky",
                left:
                  isPinned === "left"
                    ? getLeftOffsetForColumn(cell.column)
                    : undefined,
                right: isPinned === "right" ? 0 : undefined,
                zIndex: 1,
                width: cell.column.getSize(),
              }
            : {
                ...unpinnedCellStyle,
                width: cell.column.getSize(),
              };
          return (
            <TableCell key={cell.id} style={style}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </>
    ),
    [disableCheckbox, checkboxCellWithWidth, getLeftOffsetForColumn],
  );

  const selectedRows = table.getSelectedRowModel().rows;
  const numSelected = selectedRows.length;
  const selectedIds = useMemo(
    () => selectedRows.map((row) => row.id),
    [selectedRows],
  );

  const rows = table.getRowModel().rows;
  const noData = !rows || rows.length === 0;

  // Estimated row height in px (MUI dense table row)
  const ROW_HEIGHT = 37;
  // Extra rows rendered above/below the visible area to prevent blank flashes
  const OVERSCAN = 50;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // Visually hidden style for screen reader announcements
  const visuallyHidden = {
    position: "absolute" as const,
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap" as const,
    border: 0,
  };

  const ariaStatusMessage = isLoading
    ? "Loading data..."
    : error
      ? "Error loading data."
      : `Showing ${rows.length} of ${totalRows.toLocaleString()} items`;

  if (isLoading || error || noData) {
    return (
      <Box sx={{ width: "100%", marginTop: 2 }}>
        <span aria-live="polite" style={visuallyHidden}>
          {ariaStatusMessage}
        </span>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            animation="pulse"
            height={500}
            width="100%"
            data-testid="loading-skeleton"
          />
        ) : error ? (
          <Alert severity="error">
            {error.message ||
              "An error occurred while fetching data. Reload the page."}
          </Alert>
        ) : (
          <Alert severity="info">
            No data or no results match your filters.
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <span aria-live="polite" style={visuallyHidden}>
        {ariaStatusMessage}
      </span>
      <Paper
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <DataTableToolbar
          title={title}
          table={table}
          numSelected={numSelected}
          selectedIds={selectedIds}
          totalRows={totalRows}
          fetchMatchingIds={fetchMatchingIds}
          actions={actions}
          toolbarComponents={toolbarComponents}
        />
        <TableContainer
          ref={scrollContainerRef}
          data-testid="table-scroller"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            willChange: "scroll-position",
            transform: "translateZ(0)",
          }}
        >
          <Table
            sx={{
              borderCollapse: "separate",
              tableLayout: "fixed",
              minWidth: "100%",
            }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 3,
              }}
            >
              <DataTableHeader
                table={table}
                searchBody={searchBody}
                checkboxWidth={checkboxWidth}
                disableCheckbox={disableCheckbox}
                getLeftOffsetForColumn={getLeftOffsetForColumn}
                onRequestSort={handleRequestSort}
              />
            </TableHead>
            <TableBody
              onKeyDown={(e: React.KeyboardEvent<HTMLTableSectionElement>) => {
                const target = e.target as HTMLElement;
                const row = target.closest("tr");
                if (!row) return;

                if (e.key === " ") {
                  e.preventDefault();
                  const index = row.dataset.index;
                  if (index !== undefined && !disableCheckbox) {
                    rows[Number(index)]?.toggleSelected();
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = row.nextElementSibling as HTMLElement | null;
                  next?.focus();
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const prev = row.previousElementSibling as HTMLElement | null;
                  prev?.focus();
                }
              }}
            >
              {/* Top padding to maintain scroll position */}
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <tr>
                  <td
                    style={{
                      ...paddingCellStyle,
                      height: rowVirtualizer.getVirtualItems()[0].start,
                    }}
                  />
                </tr>
              )}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    ref={rowVirtualizer.measureElement}
                    tabIndex={0}
                    data-index={virtualRow.index}
                    data-row-parity={
                      virtualRow.index % 2 === 0 ? "even" : "odd"
                    }
                    onClick={() => !disableCheckbox && row.toggleSelected()}
                    sx={tableRowSx}
                    onContextMenu={(event) => handleContextMenu(event, row.id)}
                  >
                    {itemContent(virtualRow.index, row)}
                  </TableRow>
                );
              })}
              {/* Bottom padding to maintain scrollbar size */}
              {rowVirtualizer.getVirtualItems().length > 0 && (
                <tr>
                  <td
                    style={{
                      ...paddingCellStyle,
                      height:
                        rowVirtualizer.getTotalSize() -
                        (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                    }}
                  />
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!hideFooter && (
          <TablePagination
            component="div"
            rowsPerPageOptions={[25, 50, 100, 500]}
            count={totalRows}
            showFirstButton
            showLastButton
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={isMobile ? "" : "Rows per page"}
            sx={{ flexShrink: 0 }}
            data-testid="data-table-pagination"
          />
        )}
      </Paper>
      {menuItems && (
        <Menu
          open={contextMenu.mouseY !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu.mouseY !== null && contextMenu.mouseX !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {menuItems.map((menuItem, index: number) => (
            <MuiMenuItem
              key={index}
              data-testid={menuItem.dataTestId}
              onClick={() => {
                handleCloseContextMenu();
                menuItem.onClick(contextMenu.id);
              }}
            >
              {menuItem.label}
            </MuiMenuItem>
          ))}
        </Menu>
      )}
    </Box>
  );
}
