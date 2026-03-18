"use client";
import React, { useMemo, useState } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import Visibility from "@mui/icons-material/Visibility";
import { Table as TanstackTable } from "@tanstack/react-table";

import { SplitActionButton, ToolbarAction } from "./SplitActionButton";

interface DataTableToolbarProps<T extends Record<string, unknown>> {
  title: string;
  table: TanstackTable<T>;
  numSelected: number;
  selectedIds: readonly (number | string)[];
  totalRows: number;
  fetchMatchingIds?: () => Promise<(number | string)[]>;
  /** Toolbar actions rendered as split buttons (e.g. Kill, Delete) */
  actions?: ToolbarAction[];
  toolbarComponents?: React.ReactElement;
}

export function DataTableToolbar<T extends Record<string, unknown>>({
  title,
  table,
  numSelected,
  selectedIds,
  totalRows,
  fetchMatchingIds,
  actions,
  toolbarComponents,
}: DataTableToolbarProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleVisibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Built-in "Copy IDs" action — memoized to prevent unnecessary re-renders
  const copyIdsAction: ToolbarAction = useMemo(
    () => ({
      label: "Copy",
      icon: <FormatListBulleted fontSize="small" />,
      onClick: async (ids: (number | string)[]) => {
        try {
          await navigator.clipboard.writeText(JSON.stringify(ids));
          setSnackbarMessage(
            `${ids.length} ID${ids.length > 1 ? "s" : ""} copied to clipboard`,
          );
          setSnackbarOpen(true);
        } catch (err) {
          console.error("Could not copy text: ", err);
        }
      },
    }),
    [],
  );

  return (
    <Toolbar
      sx={{
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.secondary.main,
              theme.palette.action.activatedOpacity,
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {title}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {/* Copy IDs split button */}
        <SplitActionButton
          action={copyIdsAction}
          numSelected={numSelected}
          selectedIds={selectedIds}
          totalRows={totalRows}
          fetchMatchingIds={fetchMatchingIds}
        />
        {/* Domain-specific action split buttons */}
        {actions?.map((action) => (
          <SplitActionButton
            key={action.label}
            action={action}
            numSelected={numSelected}
            selectedIds={selectedIds}
            totalRows={totalRows}
            fetchMatchingIds={fetchMatchingIds}
          />
        ))}
        {/* Legacy toolbar components */}
        {numSelected > 0 && toolbarComponents}
        {/* Column visibility — always visible to avoid layout shift */}
        <Tooltip title="Hide/Show columns">
          <IconButton
            aria-label="Hide/Show columns"
            data-testid="column-visibility-button"
            onClick={handleVisibilityClick}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          data-testid="column-visibility-popover"
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="column" spacing={2}>
              {table.getAllLeafColumns().map((column) => (
                <Stack
                  key={column.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Switch
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  <Typography>{String(column.columnDef.header)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Popover>
      </Stack>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Toolbar>
  );
}
