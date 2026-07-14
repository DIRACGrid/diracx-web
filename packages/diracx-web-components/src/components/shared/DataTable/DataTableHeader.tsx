"use client";
import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useTheme } from "@mui/material";
import PushPin from "@mui/icons-material/PushPin";
import {
  Column,
  flexRender,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { SearchBody } from "../../../types";

const resizeHandleSx = {
  position: "absolute",
  right: "0%",
  top: 0,
  height: "100%",
  width: "10px",
  cursor: "col-resize",
  userSelect: "none",
  touchAction: "none",
  zIndex: 3,
} as const;

interface DataTableHeaderProps<T extends Record<string, unknown>> {
  table: TanstackTable<T>;
  searchBody: SearchBody;
  checkboxWidth: number;
  disableCheckbox: boolean;
  getLeftOffsetForColumn: (column: Column<T, unknown>) => number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
}

export function DataTableHeader<T extends Record<string, unknown>>({
  table,
  searchBody,
  checkboxWidth,
  disableCheckbox,
  getLeftOffsetForColumn,
  onRequestSort,
}: DataTableHeaderProps<T>) {
  const theme = useTheme();

  const checkboxHeaderStyle = useMemo<React.CSSProperties>(
    () => ({
      position: "sticky",
      left: 0,
      zIndex: 2,
      width: checkboxWidth,
      minWidth: checkboxWidth,
      backgroundColor: theme.palette.background.default,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    [checkboxWidth, theme.palette.background.default],
  );

  return (
    <>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {!disableCheckbox && (
            <TableCell padding="checkbox" style={checkboxHeaderStyle}>
              <Checkbox
                indeterminate={
                  table.getSelectedRowModel().rows.length > 0 &&
                  table.getSelectedRowModel().rows.length <
                    table.getState().pagination.pageSize
                }
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
            </TableCell>
          )}
          {headerGroup.headers.map((header) => (
            <TableCell
              key={header.id}
              style={{
                position: header.column.getIsPinned() ? "sticky" : "relative",
                left:
                  header.column.getIsPinned() === "left"
                    ? getLeftOffsetForColumn(header.column)
                    : undefined,
                right: header.column.getIsPinned() === "right" ? 0 : undefined,
                zIndex: header.column.getIsPinned() ? 2 : 1,
                width: header.column.getSize(),
                backgroundColor: theme.palette.background.default,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {header.isPlaceholder ? null : (
                <>
                  <TableSortLabel
                    active={
                      searchBody.sort &&
                      searchBody.sort[0]?.parameter === header.id
                    }
                    direction={
                      searchBody.sort && searchBody.sort[0]?.direction === "asc"
                        ? "asc"
                        : "desc"
                    }
                    onClick={(event) => onRequestSort(event, header.id)}
                    data-testid={`sort-${header.id}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableSortLabel>

                  <TableSortLabel
                    onClick={() => {
                      const currentPin = header.column.getIsPinned();
                      if (!currentPin) {
                        header.column.pin("left");
                      } else {
                        header.column.pin(false);
                      }
                    }}
                    active={header.column.getIsPinned() === "left"}
                    direction="desc"
                    IconComponent={PushPin}
                  />
                </>
              )}
              {header.column.getCanResize() && (
                <Box
                  sx={resizeHandleSx}
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
