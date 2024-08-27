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
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

/**
 * Filter form props
 * @property {Column[]} columns - the columns on which to filter
 * @property {function} handleFilterChange - the function to call when a filter is changed
 * @property {function} handleFilterMenuClose - the function to call when the filter menu is closed
 * @property {Filter[]} filters - the filters for the table
 * @property {number} selectedFilterId - the id of the selected filter
 */
interface FilterFormProps {
  /** The columns of the data table */
  columns: Column[];
  /** The function to call when a filter is changed */
  handleFilterChange: (index: number, tempFilter: Filter) => void;
  /** The function to call when the filter menu is closed */
  handleFilterMenuClose: () => void;
  /** The filters for the table */
  filters: Filter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The id of the selected filter */
  selectedFilterId: number | undefined;
}

/**
 * Filter form component
 *
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
      setTempFilter({
        id: Date.now(),
        column: "",
        operator: "eq",
        value: "",
      });
    }
  }, [filters, filterIndex]);

  if (!tempFilter) return null;

  const onChange = (field: string, value: string | string[] | undefined) => {
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

  const selectedColumn = columns.find((c) => c.id == tempFilter.column);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6" padding={1}>
          Edit Filter
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl variant="outlined">
            <InputLabel id="column">Column</InputLabel>
            <Select
              value={tempFilter.column}
              onChange={(e) => {
                onChange("column", e.target.value);
                console.log(columns.find((c) => c.id == e.target.value)?.type);
                if (
                  columns.find((c) => c.id == e.target.value)?.type ==
                  "DateTime"
                )
                  onChange("operator", "last");
                else if (tempFilter.operator == "last") {
                  onChange("operator", "eq");
                  onChange("value", "");
                }
              }}
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

          <FormControl variant="outlined">
            <InputLabel id="operator">Operator</InputLabel>
            <Select
              value={tempFilter.operator}
              onChange={(e) => {
                onChange(
                  ["in", "not in"].includes(e.target.value)
                    ? "values"
                    : "value",
                  [] || "",
                );
                onChange(
                  ["in", "not in"].includes(e.target.value)
                    ? "value"
                    : "values",
                  undefined,
                );
                onChange("operator", e.target.value);
              }}
              label="Operator"
              labelId="operator"
              data-testid="filter-form-select-operator"
              sx={{ minWidth: 120 }}
            >
              {selectedColumn?.type != "DateTime" && (
                <MenuItem value="eq">equals to</MenuItem>
              )}
              {selectedColumn?.type != "DateTime" && (
                <MenuItem value="neq">not equals to</MenuItem>
              )}

              {selectedColumn?.type == "DateTime" && (
                <MenuItem value="last">in the last</MenuItem>
              )}

              {typeof selectedColumn?.type != "object" && (
                <MenuItem value="gt">is greater than</MenuItem>
              )}
              {typeof selectedColumn?.type != "object" && (
                <MenuItem value="lt">is lower than</MenuItem>
              )}
              {(typeof selectedColumn?.type == "object" ||
                selectedColumn?.type == "number") && (
                <MenuItem value="in">is in</MenuItem>
              )}
              {(typeof selectedColumn?.type == "object" ||
                selectedColumn?.type == "number") && (
                <MenuItem value="not in">is not in</MenuItem>
              )}
              {selectedColumn?.type != "DateTime" && (
                <MenuItem value="like">like</MenuItem>
              )}
            </Select>
          </FormControl>

          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={"en-gb"}
          >
            <FormControl variant="outlined">
              {typeof selectedColumn?.type == "object" &&
              tempFilter.operator != "like" ? (
                <>
                  <InputLabel id="value">Value</InputLabel>
                  <Select
                    label="Value"
                    labelId="value"
                    value={
                      ["in", "not in"].includes(tempFilter.operator)
                        ? tempFilter.values
                        : tempFilter.value
                    }
                    onChange={(e) =>
                      onChange(
                        ["in", "not in"].includes(tempFilter.operator)
                          ? "values"
                          : "value",
                        e.target.value,
                      )
                    }
                    multiple={["in", "not in"].includes(tempFilter.operator)}
                    sx={{ minWidth: 100 }}
                  >
                    {selectedColumn?.type.map((val: string) => (
                      <MenuItem key={val} value={val}>
                        {selectedColumn.render
                          ? selectedColumn.render(val)
                          : val}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              ) : selectedColumn?.type == "DateTime" &&
                tempFilter.operator != "last" ? (
                <DateTimePicker
                  label="Value"
                  value={dayjs(tempFilter.value)}
                  onChange={(e) => onChange("value", e?.toISOString() || "")}
                  views={["year", "day", "hours", "minutes", "seconds"]}
                />
              ) : selectedColumn?.type == "DateTime" &&
                tempFilter.operator == "last" ? (
                <>
                  <InputLabel id="value">Value</InputLabel>
                  <Select
                    label="Value"
                    labelId="value"
                    value={tempFilter.value}
                    onChange={(e) => onChange("value", e.target.value)}
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="hour">Hour</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </>
              ) : selectedColumn?.type == "number" &&
                !["in", "not in", "like"].includes(tempFilter.operator) ? (
                <TextField
                  id="value"
                  variant="outlined"
                  label="Value"
                  value={tempFilter.value}
                  onChange={(e) => onChange("value", e.target.value)}
                  type="number"
                />
              ) : selectedColumn?.type == "number" &&
                ["in", "not in"].includes(tempFilter.operator) ? (
                <TextField
                  id="value"
                  variant="outlined"
                  label="Value"
                  value={tempFilter.values?.join(" ")}
                  onChange={(e) =>
                    onChange("values", e.target.value.split(" "))
                  }
                />
              ) : (
                <TextField
                  id="value"
                  variant="outlined"
                  label="Value"
                  value={tempFilter.value}
                  onChange={(e) => onChange("value", e.target.value)}
                />
              )}
            </FormControl>
          </LocalizationProvider>

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
