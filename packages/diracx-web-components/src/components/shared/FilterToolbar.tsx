"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { grey } from "@mui/material/colors";
import { FilterList, Delete, Send, Refresh } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Alert, Box, Popover, Stack, Tooltip } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { InternalFilter } from "../../types/Filter";
import { FilterForm } from "./FilterForm";
import "../../hooks/theme";

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 */
export interface FilterToolbarProps<T extends Record<string, unknown>> {
  /** The columns of the data table */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  /** The filters */
  filters: InternalFilter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  /** The function to apply the filters */
  handleApplyFilters: () => void;
  /** The function to remove all filters */
  handleClearFilters: () => void;
}

/**
 * Filter toolbar component
 *
 * @returns a FilterToolbar component
 */
export function FilterToolbar<T extends Record<string, unknown>>({
  columns,
  filters,
  setFilters,
  handleApplyFilters,
  handleClearFilters,
}: FilterToolbarProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<InternalFilter | null>(
    null,
  );
  const addFilterButtonRef = useRef<HTMLButtonElement>(null);

  // Filter actions
  const handleAddFilter = useCallback(() => {
    // Create a new filter: it will not be used
    // It is just a placeholder to open the filter form
    const newFilter = {
      id: Date.now(),
      parameter: "",
      operator: "eq",
      value: "",
      isApplied: false,
    };
    setSelectedFilter(newFilter);
    setAnchorEl(addFilterButtonRef.current);
  }, [setSelectedFilter, setAnchorEl]);

  const handleFilterChange = (index: number, newFilter: InternalFilter) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? newFilter : filter,
    );
    setFilters(updatedFilters);
  };

  const open = Boolean(anchorEl);

  // Filter menu
  /**
   * Handle the filter menu open
   * @param {React.MouseEvent<HTMLElement>} event - the event that triggered the menu open
   */
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle the filter menu close
   */
  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const changesUnapplied = useCallback(() => {
    return filters.some((filter) => !filter.isApplied);
  }, [filters]);

  function debounce<T extends (event: KeyboardEvent) => void>(
    func: T,
    wait: number,
  ) {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function executedFunction(event: KeyboardEvent) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(event), wait);
    };
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "a":
            event.preventDefault();
            event.stopPropagation();
            handleAddFilter();
            break;
          case "p":
            event.preventDefault();
            event.stopPropagation();
            handleApplyFilters();
            break;
          case "c":
            event.preventDefault();
            event.stopPropagation();
            handleClearFilters();
            break;
          default:
            break;
        }
      }
    };

    // Debounce the keypress handler to avoid rapid successive invocations
    const debouncedHandleKeyPress = debounce(handleKeyPress, 300);

    // Add event listener
    window.addEventListener("keydown", debouncedHandleKeyPress);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("keydown", debouncedHandleKeyPress);
    };
  }, [handleAddFilter, handleApplyFilters, handleClearFilters]);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ m: 1 }} alignItems={"center"}>
        <Tooltip title="Alt+Shift+a" placement="top">
          <span>
            <Button
              variant="text"
              startIcon={<FilterList />}
              onClick={handleAddFilter}
              ref={addFilterButtonRef}
              data-testid="add-filter-button"
            >
              <span>Add filter</span>
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Alt+Shift+p" placement="top">
          <span>
            <Button
              variant="text"
              startIcon={changesUnapplied() ? <Send /> : <Refresh />}
              onClick={() => handleApplyFilters()}
              data-testid="apply-filters-button"
            >
              <span>
                {changesUnapplied() ? "Apply filters" : "Refresh page"}
              </span>
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Alt+Shift+c" placement="top">
          <span>
            <Button
              variant="text"
              startIcon={<Delete />}
              onClick={handleClearFilters}
              disabled={filters.length === 0}
              data-testid="clear-filters-button"
            >
              <span>Clear all filters</span>
            </Button>
          </span>
        </Tooltip>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ m: 1 }}
      >
        {filters.map((filter: InternalFilter, index: number) => (
          <Chip
            key={index}
            label={`${filter.parameter} ${filter.operator} ${filter.value || filter.values}`}
            onClick={(event) => {
              handleFilterMenuOpen(event); // Open the menu
              setSelectedFilter(filter); // Set the selected filter
            }}
            onDelete={() => {
              handleRemoveFilter(index);
            }}
            sx={{
              m: 0.5,
              backgroundColor: filter.isApplied ? "primary.main" : grey[500],
            }}
            className={
              filter.isApplied ? "chip-filter-applied" : "chip-filter-unapplied"
            }
          />
        ))}

        <Popover
          open={open}
          onClose={handleFilterMenuClose}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <FilterForm
            columns={columns}
            handleFilterChange={handleFilterChange}
            handleFilterMenuClose={handleFilterMenuClose}
            filters={filters}
            setFilters={setFilters}
            selectedFilterId={selectedFilter?.id}
          />
        </Popover>
      </Stack>
      {changesUnapplied() && (
        <Box marginBottom={1}>
          <Alert severity="info">
            Some filter changes have not been applied. Please click on
            &quot;Apply filters&quot; to update your results.
          </Alert>
        </Box>
      )}
    </>
  );
}
