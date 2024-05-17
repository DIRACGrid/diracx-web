import React from "react";
import { FilterList, Delete, Send } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { Popover, Stack, Tooltip } from "@mui/material";
import { FilterForm } from "./FilterForm";
import { Filter } from "@/types/Filter";
import { Column } from "@/types/Column";

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 */
interface FilterToolbarProps {
  columns: Column[];
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  handleApplyFilters: () => void;
}

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 * @returns a FilterToolbar component
 */
export function FilterToolbar(props: FilterToolbarProps) {
  const { columns, filters, setFilters, handleApplyFilters } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState<Filter | null>(
    null
  );
  const addFilterButtonRef = React.useRef<HTMLButtonElement>(null);

  // Filter actions
  const handleAddFilter = React.useCallback(() => {
    // Create a new filter: it will not be used
    // It is just a placeholder to open the filter form
    const newFilter = {
      id: Date.now(),
      column: "",
      operator: "eq",
      value: "",
    };
    setSelectedFilter(newFilter);
    setAnchorEl(addFilterButtonRef.current);
  }, [setSelectedFilter, setAnchorEl]);

  const handleRemoveAllFilters = React.useCallback(() => {
    setFilters([]);
  }, [setFilters]);

  const handleFilterChange = (index: number, newFilter: Filter) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? newFilter : filter
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

  // Keyboard shortcuts
  React.useEffect(() => {
    function debounce(func: (...args: any[]) => void, wait: number) {
      let timeout: ReturnType<typeof setTimeout> | undefined;

      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    const handleKeyPress = (event: {
      altKey: any;
      shiftKey: any;
      key: string;
      preventDefault: () => void;
      stopPropagation: () => void;
    }) => {
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
      <Stack direction="row" spacing={1} sx={{ m: 1 }}>
        <Tooltip title="Alt+Shift+a" placement="top">
          <Button
            variant="text"
            startIcon={<FilterList />}
            onClick={handleAddFilter}
            ref={addFilterButtonRef}
          >
            <span>Add filter</span>
          </Button>
        </Tooltip>
        <Tooltip title="Alt+Shift+p" placement="top">
          <Button
            variant="text"
            startIcon={<Send />}
            onClick={() => handleApplyFilters()}
          >
            <span>Apply filters</span>
          </Button>
        </Tooltip>
        <Tooltip title="Alt+Shift+c" placement="top">
          <Button
            variant="text"
            startIcon={<Delete />}
            onClick={handleRemoveAllFilters}
          >
            <span>Clear all filters</span>
          </Button>
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ m: 1, flexWrap: "wrap" }}>
        {filters.map((filter: Filter, index: number) => (
          <Chip
            key={index}
            label={`${filter.column} ${filter.operator} ${filter.value}`}
            onClick={(event) => {
              handleFilterMenuOpen(event); // Open the menu
              setSelectedFilter(filter); // Set the selected filter
            }}
            onDelete={() => {
              handleRemoveFilter(index);
            }}
            color="primary"
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
    </>
  );
}
