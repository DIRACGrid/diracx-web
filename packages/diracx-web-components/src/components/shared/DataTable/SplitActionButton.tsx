"use client";
import React, { useRef, useState } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import MenuList from "@mui/material/MenuList";
import MuiMenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";

/** Maximum number of results for "all matching" operations */
const MAX_BULK_RESULTS = 10000;

/**
 * Describes a toolbar action that can operate on selected rows or all matching rows.
 */
export interface ToolbarAction {
  /** Display label for the action (used in dropdown menu items) */
  label: string;
  /** Icon displayed in the button */
  icon: React.ReactNode;
  /** Called with the resolved IDs when the action is executed */
  onClick: (ids: (number | string)[]) => Promise<void> | void;
  /** Whether to show a confirmation dialog before executing on "all matching" */
  requiresConfirmation?: boolean;
  /** Confirmation message — string or function receiving the count */
  confirmationMessage?: string | ((count: number) => string);
  /** data-testid for the main button */
  "data-testid"?: string;
}

interface SplitActionButtonProps {
  action: ToolbarAction;
  numSelected: number;
  selectedIds: readonly (number | string)[];
  totalRows: number;
  fetchMatchingIds?: () => Promise<(number | string)[]>;
}

export function SplitActionButton({
  action,
  numSelected,
  selectedIds,
  totalRows,
  fetchMatchingIds,
}: SplitActionButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const canActOnAll =
    fetchMatchingIds && totalRows <= MAX_BULK_RESULTS && totalRows > 0;

  const executeAction = async (ids: (number | string)[]) => {
    setIsLoading(true);
    try {
      await action.onClick(ids);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedAction = () => {
    setMenuOpen(false);
    executeAction([...selectedIds]);
  };

  const fetchAndExecute = async () => {
    if (!fetchMatchingIds) return;
    setIsLoading(true);
    try {
      const ids = await fetchMatchingIds();
      await action.onClick(ids);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllMatchingAction = () => {
    if (!fetchMatchingIds) return;
    setMenuOpen(false);

    if (action.requiresConfirmation) {
      setConfirmOpen(true);
      return;
    }

    fetchAndExecute();
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    fetchAndExecute();
  };

  const handleDefaultClick = () => {
    if (numSelected > 0) {
      handleSelectedAction();
    } else {
      handleAllMatchingAction();
    }
  };

  const defaultDisabled =
    numSelected > 0 ? isLoading : !canActOnAll || isLoading;

  const defaultTooltip =
    numSelected > 0
      ? `${action.label} ${numSelected} selected`
      : totalRows > MAX_BULK_RESULTS
        ? `Too many results (${totalRows.toLocaleString()}). Refine filters to < ${MAX_BULK_RESULTS.toLocaleString()}.`
        : totalRows === 0
          ? "No matching results"
          : `${action.label} all ${totalRows.toLocaleString()} matching`;

  const confirmMessage =
    typeof action.confirmationMessage === "function"
      ? action.confirmationMessage(totalRows)
      : action.confirmationMessage ||
        `Are you sure you want to ${action.label.toLowerCase()} all ${totalRows.toLocaleString()} matching items?`;

  return (
    <>
      <ButtonGroup
        ref={buttonRef}
        variant="outlined"
        size="small"
        sx={{
          "& .MuiButtonGroup-grouped": {
            minWidth: 0,
            borderColor: "divider",
          },
        }}
      >
        <Tooltip title={defaultTooltip}>
          <span>
            <IconButton
              size="small"
              onClick={handleDefaultClick}
              disabled={defaultDisabled}
              aria-label={action.label}
              data-testid={action["data-testid"]}
            >
              {isLoading ? <CircularProgress size={18} /> : action.icon}
            </IconButton>
          </span>
        </Tooltip>
        {fetchMatchingIds && (
          <IconButton
            size="small"
            onClick={() => setMenuOpen((prev) => !prev)}
            disabled={isLoading}
            aria-label={`${action.label} options`}
            sx={{ px: 0.25 }}
          >
            <ArrowDropDown fontSize="small" />
          </IconButton>
        )}
      </ButtonGroup>
      <Popper
        open={menuOpen}
        anchorEl={buttonRef.current}
        role={undefined}
        transition
        disablePortal
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper elevation={4}>
              <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                <MenuList autoFocusItem dense>
                  {numSelected > 0 && (
                    <MuiMenuItem onClick={handleSelectedAction}>
                      {action.label} {numSelected} selected
                    </MuiMenuItem>
                  )}
                  <Tooltip
                    title={
                      totalRows > MAX_BULK_RESULTS
                        ? `Too many results (${totalRows.toLocaleString()}). Refine filters to fewer than ${MAX_BULK_RESULTS.toLocaleString()}.`
                        : ""
                    }
                    placement="left"
                  >
                    <span>
                      <MuiMenuItem
                        onClick={handleAllMatchingAction}
                        disabled={!canActOnAll}
                      >
                        {action.label} all {totalRows.toLocaleString()} matching
                      </MuiMenuItem>
                    </span>
                  </Tooltip>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* Confirmation dialog for destructive "all matching" actions */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm {action.label}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            {action.label}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
