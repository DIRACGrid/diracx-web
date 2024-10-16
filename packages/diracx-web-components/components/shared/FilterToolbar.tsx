import React from "react";
import { FilterList, Delete, Send } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Alert, Popover, Stack, Tooltip } from "@mui/material";
import { FilterForm } from "./FilterForm";
import { InternalFilter } from "@/types/Filter";
import { Column } from "@/types/Column";
import "@/hooks/theme";

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 */
interface FilterToolbarProps {
  /** The columns of the data table */
  columns: Column[];
  /** The filters to apply */
  filters: InternalFilter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  /** The applied filters */
  appliedFilters: InternalFilter[];
  /** The function to apply the filters */
  handleApplyFilters: () => void;
}

/**
 * Filter toolbar component
 *
 * @returns a FilterToolbar component
 */
export function FilterToolbar(props: FilterToolbarProps) {
  const { columns, filters, setFilters, appliedFilters, handleApplyFilters } =
    props;
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

  const handleRemoveAllFilters = React.useCallback(() => {
    setFilters([]);
  }, [setFilters]);

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
            handleRemoveAllFilters();
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
  }, [handleAddFilter, handleApplyFilters, handleRemoveAllFilters]);

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
              startIcon={<Send />}
              onClick={() => handleApplyFilters()}
              disabled={!changesUnapplied()}
            >
              <span>Apply filters</span>
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Alt+Shift+c" placement="top">
          <span>
            <Button
              variant="text"
              startIcon={<Delete />}
              onClick={handleRemoveAllFilters}
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
            color={isApplied(filter) ? "chipColor" : "default"}
            sx={{ m: 0.5 }}
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
        <Alert severity="info">
          Some filter changes have not been applied. Please click on &quot;Apply
          filters&quot; to update your results.
        </Alert>
      )}
    </>
  );
}
