import React from "react";
import { CheckCircle } from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Filter } from "@/types/Filter";
import { Column } from "@/types/Column";

/**
 * Filter form props
 * @property {Column[]} columns - the columns on which to filter
 * @property {function} handleFilterChange - the function to call when a filter is changed
 * @property {function} handleFilterMenuClose - the function to call when the filter menu is closed
 * @property {Filter[]} filters - the filters for the table
 * @property {number} selectedFilterId - the id of the selected filter
 */
interface FilterFormProps {
  columns: Column[];
  handleFilterChange: (index: number, tempFilter: Filter) => void;
  handleFilterMenuClose: () => void;
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  selectedFilterId: number | undefined;
}

/**
 * Filter form component
 * @param {FilterFormProps} props - the props for the component
 * @returns a FilterForm component
 */
export function FilterForm(props: FilterFormProps) {
  const {
    columns,
    filters,
    setFilters,
    handleFilterChange,
    handleFilterMenuClose,
    selectedFilterId,
  } = props;
  const [tempFilter, setTempFilter] = React.useState<Filter | null>(null);

  // Find the index using the filter ID
  const filterIndex = filters.findIndex((f) => f.id === selectedFilterId);

  // Set the temp filter
  React.useEffect(() => {
    if (filterIndex !== -1) {
      setTempFilter(filters[filterIndex]);
    } else {
      setTempFilter({ id: Date.now(), column: "", operator: "eq", value: "" });
    }
  }, [filters, filterIndex]);

  if (!tempFilter) return null;

  const onChange = (field: string, value: string) => {
    setTempFilter((prevFilter: Filter | null) => {
      if (prevFilter === null) {
        return null; // or initialize a new Filter object as appropriate
      }
      // Ensuring all fields of Filter are always defined
      const updatedFilter: Filter = {
        ...prevFilter,
        [field]: value,
      };
      return updatedFilter;
    });
  };

  const applyChanges = () => {
    if (filterIndex === -1) {
      setFilters([...filters, tempFilter]);
    } else {
      handleFilterChange(filterIndex, tempFilter);
    }
    handleFilterMenuClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6" padding={1}>
          Edit Filter
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="column">Column</InputLabel>
            <Select
              value={tempFilter.column}
              onChange={(e) => onChange("column", e.target.value)}
              label="Column"
              labelId="column"
              data-testid="filter-form-select-column"
              sx={{ minWidth: 120 }}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  {column.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <InputLabel id="operator">Operator</InputLabel>
            <Select
              value={tempFilter.operator}
              onChange={(e) => onChange("operator", e.target.value)}
              label="Operator"
              labelId="operator"
              data-testid="filter-form-select-operator"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="eq">equals to</MenuItem>
              <MenuItem value="neq">not equals to</MenuItem>
              <MenuItem value="gt">is greater than</MenuItem>
              <MenuItem value="lt">is lower than</MenuItem>
              <MenuItem value="like">like</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" fullWidth>
            <TextField
              id="value"
              variant="outlined"
              label="Value"
              value={tempFilter.value}
              onChange={(e) => onChange("value", e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </FormControl>

          <Tooltip title="Finish editing filter">
            <IconButton onClick={() => applyChanges()} color="success">
              <CheckCircle />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
