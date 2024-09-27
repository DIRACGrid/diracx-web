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
import "dayjs/locale/en-gb"; // needed by LocalizationProvider to format Dates to dd-mm-yyyy

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

  const types: {
    [type: string]: { operators: string[]; defaultOperator: string };
  } = {
    DateTime: { operators: ["last", "gt", "lt"], defaultOperator: "last" },
    category: {
      operators: ["eq", "neq", "in", "not in", "like"],
      defaultOperator: "eq",
    },
    number: {
      operators: ["eq", "neq", "gt", "lt", "like"],
      defaultOperator: "eq",
    },
    default: {
      operators: ["eq", "neq", "gt", "lt", "like"],
      defaultOperator: "eq",
    },
  };

  const operatorText: { [operator: string]: string } = {
    eq: "equals to",
    neq: "not equals to",
    last: "in the last",
    gt: "is greater than",
    lt: "is lower than",
    in: "is in",
    "not in": "is not in",
    like: "like",
  };

  function operatorSelector() {
    if (tempFilter)
      return (
        <FormControl variant="outlined">
          <InputLabel id="operator">Operator</InputLabel>
          <Select
            value={tempFilter.operator}
            onChange={(e) => {
              onChange(
                ["in", "not in"].includes(e.target.value) ? "values" : "value",
                [] || "",
              );
              onChange(
                ["in", "not in"].includes(e.target.value) ? "value" : "values",
                undefined,
              );
              onChange("operator", e.target.value);
            }}
            label="Operator"
            labelId="operator"
            data-testid="filter-form-select-operator"
            sx={{ minWidth: 120 }}
          >
            {types[
              typeof selectedColumn?.type == "object"
                ? "category"
                : selectedColumn?.type || "default"
            ].operators.map((operator) => (
              <MenuItem key={operator} value={operator}>
                {operatorText[operator]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
  }

  function valueSelector() {
    if (!tempFilter) return null;
    if (selectedColumn?.type == "DateTime") {
      if (tempFilter.operator != "last")
        return (
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={"en-gb"}
          >
            <FormControl variant="outlined">
              <DateTimePicker
                label="Value"
                value={dayjs(tempFilter.value)}
                onChange={(e) => onChange("value", e?.toISOString() || "")}
                views={["year", "day", "hours", "minutes", "seconds"]}
              />
            </FormControl>
          </LocalizationProvider>
        );
      else
        return (
          <FormControl variant="outlined">
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
          </FormControl>
        );
    }

    if (
      typeof selectedColumn?.type == "object" &&
      tempFilter.operator != "like"
    )
      return (
        <FormControl variant="outlined">
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
                {selectedColumn.render ? selectedColumn.render(val) : val}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    if (selectedColumn?.type == "number") {
      if (!["in", "not in", "like"].includes(tempFilter.operator))
        return (
          <FormControl variant="outlined">
            <TextField
              id="value"
              variant="outlined"
              label="Value"
              value={tempFilter.value}
              onChange={(e) => onChange("value", e.target.value)}
              type="number"
            />
          </FormControl>
        );
      else if (["in", "not in"].includes(tempFilter.operator))
        return (
          <FormControl variant="outlined">
            <TextField
              id="value"
              variant="outlined"
              label="Value"
              value={tempFilter.values?.join(" ")}
              onChange={(e) => onChange("values", e.target.value.split(" "))}
            />
          </FormControl>
        );
    }
    return (
      <FormControl variant="outlined">
        <TextField
          id="value"
          variant="outlined"
          label="Value"
          value={tempFilter.value}
          onChange={(e) => onChange("value", e.target.value)}
        />
      </FormControl>
    );
  }

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
                onChange(
                  "operator",
                  types[
                    typeof columns.find((v) => v.id == e.target.value)?.type ==
                    "object"
                      ? "category"
                      : (columns.find((v) => v.id == e.target.value)
                          ?.type as string) || "default"
                  ]?.defaultOperator,
                );
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

          {operatorSelector()}

          {valueSelector()}

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
