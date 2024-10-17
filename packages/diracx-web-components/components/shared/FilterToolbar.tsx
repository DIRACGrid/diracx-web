import React from "react";
import { grey } from "@mui/material/colors";
import { FilterList, Delete, Send, Refresh } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Alert, Box, Popover, Stack, Tooltip } from "@mui/material";
import { Column } from "@tanstack/react-table";
import { FilterForm } from "./FilterForm";
import { InternalFilter } from "@/types/Filter";
import "@/hooks/theme";

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 */
export interface FilterToolbarProps<T extends Record<string, unknown>> {
  /** The columns of the data table */
  columns: Column<T>[];
  /** The filters to apply */
  filters: InternalFilter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  /** The applied filters */
  appliedFilters: InternalFilter[];
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
export function FilterToolbar<T extends Record<string, unknown>>(
  props: FilterToolbarProps<T>,
) {
  const {
    columns,
    filters,
    setFilters,
    appliedFilters,
    handleApplyFilters,
    handleClearFilters,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedFilter, setSelectedFilter] =
    React.useState<InternalFilter | null>(null);
  const addFilterButtonRef = React.useRef<HTMLButtonElement>(null);

  // Filter actions
  const handleAddFilter = React.useCallback(() => {
    // Create a new filter: it will not be used
    // It is just a placeholder to open the filter form
    const newFilter = {
      id: Date.now(),
      parameter: "",
      operator: "eq",
      value: "",
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

  const changesUnapplied = React.useCallback(() => {
    return JSON.stringify(filters) !== JSON.stringify(appliedFilters);
  }, [filters, appliedFilters]);

  const isApplied = React.useCallback(
    (filter: InternalFilter) => {
      return appliedFilters.some((f) => f.id == filter.id);
    },
    [appliedFilters],
  );

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
  React.useEffect(() => {
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
              backgroundColor: isApplied(filter) ? "primary.main" : grey[500],
            }}
            className={
              isApplied(filter)
                ? "chip-filter-applied"
                : "chip-filter-unapplied"
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
