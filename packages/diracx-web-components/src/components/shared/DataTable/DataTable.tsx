"use client";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
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
  LinearProgress,
  Menu,
  MenuItem as MuiMenuItem,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Column,
  ColumnSizingState,
  flexRender,
  Row,
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SearchBody } from "../../../types";
import { visuallyHidden } from "../visuallyHidden";
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

// Static sx for the DataTable shell, hoisted so they aren't recreated on every render.
const outerBoxSx = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflow: "hidden",
} as const;

const paperSx = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
} as const;

const tableContainerSx = {
  flexGrow: 1,
  overflow: "auto",
  willChange: "scroll-position",
  transform: "translateZ(0)",
} as const;

const tableSx = {
  borderCollapse: "separate",
  tableLayout: "fixed",
  minWidth: "100%",
} as const;

const tableHeadSx = {
  position: "sticky",
  top: 0,
  zIndex: 3,
} as const;

const paginationSx = { flexShrink: 0 } as const;

const loadingOuterSx = { width: "100%", marginTop: 2 } as const;

// Fixed-height slot for the revalidation progress bar so toggling it
// does not shift the table rows.
const progressSlotSx = { height: 4, flexShrink: 0 } as const;

// Estimated row height in px (MUI dense table row)
const ROW_HEIGHT = 37;
// Extra rows rendered above/below the visible area to prevent blank flashes
const OVERSCAN = 8;

interface DataTableRowProps<T extends Record<string, unknown>> {
  /** The TanStack row model (referentially stable across parent re-renders) */
  row: Row<T>;
  /** Index of the row in the (virtualized) row model */
  virtualIndex: number;
  /**
   * Selection state passed explicitly: `row` is referentially stable, so
   * memo would not see selection changes read via `row.getIsSelected()`.
   */
  isSelected: boolean;
  /** Whether the selection checkbox column is disabled */
  disableCheckbox: boolean;
  /** Precomputed style for the sticky checkbox cell */
  checkboxCellStyle: React.CSSProperties;
  /** Precomputed left offsets (px) for left-pinned columns, by column id */
  pinnedLeftOffsets: Record<string, number>;
  /** Context menu handler (stable identity) */
  onContextMenu: (event: React.MouseEvent, id: string) => void;
  /**
   * Not read directly: column sizing/visibility are consumed through the
   * column APIs (`getSize`, `getVisibleCells`), which memo cannot track.
   * Passing the state objects invalidates the memo when they change.
   */
  columnSizing: ColumnSizingState;
  columnVisibility: VisibilityState;
}

function DataTableRowComponent<T extends Record<string, unknown>>(
  props: DataTableRowProps<T>,
) {
  const {
    row,
    virtualIndex,
    isSelected,
    disableCheckbox,
    checkboxCellStyle,
    pinnedLeftOffsets,
    onContextMenu,
  } = props;

  return (
    <TableRow
      tabIndex={0}
      data-index={virtualIndex}
      data-row-parity={virtualIndex % 2 === 0 ? "even" : "odd"}
      onClick={() => !disableCheckbox && row.toggleSelected()}
      sx={tableRowSx}
      onContextMenu={(event) => onContextMenu(event, row.id)}
    >
      {!disableCheckbox && (
        <TableCell
          padding="checkbox"
          style={checkboxCellStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            size="small"
            name={`select-row-${row.id}`}
            checked={isSelected}
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
                  ? pinnedLeftOffsets[cell.column.id]
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
    </TableRow>
  );
}

/**
 * Memoized table row. Rows are fixed-height and their row models are
 * referentially stable, so scroll frames and unrelated parent re-renders
 * bail out; row-level state (selection, sizing, visibility, pinning)
 * is passed as explicit props to invalidate only the affected rows.
 */
const DataTableRow = memo(
  DataTableRowComponent,
) as typeof DataTableRowComponent;

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
      setSearchBody((prevState: SearchBody) => {
        const isAsc =
          prevState.sort &&
          prevState.sort[0]?.parameter === property &&
          prevState.sort[0]?.direction === "asc";
        return {
          ...prevState,
          sort: [{ parameter: property, direction: isAsc ? "desc" : "asc" }],
        };
      });
    },
    [setSearchBody],
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

  const { columnPinning, columnSizing, columnVisibility } = table.getState();

  // Precompute the left offsets of pinned columns once per pinning/sizing
  // change (instead of an O(pinned^2) per-cell loop).
  const pinnedLeftOffsets = useMemo(() => {
    // columnPinning/columnSizing are read indirectly through
    // table.getLeftLeafColumns() and col.getSize(); reference them here so
    // the memo recomputes when they change.
    void columnPinning;
    void columnSizing;
    const offsets: Record<string, number> = {};
    let offset = checkboxWidth;
    for (const col of table.getLeftLeafColumns()) {
      offsets[col.id] = offset;
      offset += col.getSize();
    }
    return offsets;
  }, [table, checkboxWidth, columnPinning, columnSizing]);

  const getLeftOffsetForColumn = useCallback(
    (column: Column<T, unknown>): number =>
      pinnedLeftOffsets[column.id] ?? checkboxWidth,
    [pinnedLeftOffsets, checkboxWidth],
  );

  const checkboxCellWithWidth = useMemo<React.CSSProperties>(
    () => ({ ...checkboxCellStyle, width: checkboxWidth }),
    [checkboxWidth],
  );

  const selectedRows = table.getSelectedRowModel().rows;
  const numSelected = selectedRows.length;
  const selectedIds = useMemo(
    () => selectedRows.map((row) => row.id),
    [selectedRows],
  );

  const rows = table.getRowModel().rows;
  const noData = !rows || rows.length === 0;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const ariaStatusMessage = isLoading
    ? "Loading data..."
    : error
      ? "Error loading data."
      : `Showing ${rows.length} of ${totalRows.toLocaleString()} items`;

  // Show the full-size skeleton only on first load (no rows to display yet).
  // While revalidating with stale rows (SWR keepPreviousData), the table
  // stays mounted and a slim progress bar is shown instead.
  const showSkeleton = isLoading && noData;

  if (showSkeleton || error || noData) {
    return (
      <Box sx={loadingOuterSx}>
        <span aria-live="polite" style={visuallyHidden}>
          {ariaStatusMessage}
        </span>
        {showSkeleton ? (
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
    <Box sx={outerBoxSx}>
      <span aria-live="polite" style={visuallyHidden}>
        {ariaStatusMessage}
      </span>
      <Paper sx={paperSx}>
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
        <Box sx={progressSlotSx}>
          {isLoading && (
            <LinearProgress
              aria-label="Refreshing data"
              data-testid="table-refresh-progress"
            />
          )}
        </Box>
        <TableContainer
          ref={scrollContainerRef}
          data-testid="table-scroller"
          sx={tableContainerSx}
        >
          <Table sx={tableSx} aria-labelledby="tableTitle" size="small">
            <TableHead sx={tableHeadSx}>
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
              {/* Top padding to maintain scroll position. Only rendered when
                  non-empty so that `tbody tr:first-child` stays a data row. */}
              {rowVirtualizer.getVirtualItems().length > 0 &&
                rowVirtualizer.getVirtualItems()[0].start > 0 && (
                  <tr aria-hidden="true">
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
                  <DataTableRow<T>
                    key={row.id}
                    row={row}
                    virtualIndex={virtualRow.index}
                    isSelected={row.getIsSelected()}
                    disableCheckbox={disableCheckbox}
                    checkboxCellStyle={checkboxCellWithWidth}
                    pinnedLeftOffsets={pinnedLeftOffsets}
                    onContextMenu={handleContextMenu}
                    columnSizing={columnSizing}
                    columnVisibility={columnVisibility}
                  />
                );
              })}
              {/* Bottom padding to maintain scrollbar size. Only rendered when
                  non-empty so that `tbody tr:last-child` stays a data row. */}
              {rowVirtualizer.getVirtualItems().length > 0 &&
                rowVirtualizer.getTotalSize() -
                  (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0) >
                  0 && (
                  <tr aria-hidden="true">
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
            sx={paginationSx}
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
