import React from "react";
import { CheckCircle } from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Column } from "@/types/Column";
import { InternalFilter } from "@/types/Filter";
import "dayjs/locale/en-gb"; // needed by LocalizationProvider to format Dates to dd-mm-yyyy

/**
 * Filter form props
 * @property {Column[]} columns - the columns on which to filter
 * @property {function} handleFilterChange - the function to call when a filter is changed
 * @property {function} handleFilterMenuClose - the function to call when the filter menu is closed
 * @property {InternalFilter[]} filters - the filters for the table
 * @property {number} selectedFilterId - the id of the selected filter
 */
interface FilterFormProps {
  /** The columns of the data table */
  columns: Column[];
  /** The function to call when a filter is changed */
  handleFilterChange: (index: number, tempFilter: InternalFilter) => void;
  /** The function to call when the filter menu is closed */
  handleFilterMenuClose: () => void;
  /** The filters for the table */
  filters: InternalFilter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
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
  const [tempFilter, setTempFilter] = React.useState<InternalFilter | null>(
    null,
  );

  // Find the index using the filter ID
  const filterIndex = filters.findIndex((f) => f.id === selectedFilterId);

  // Set the temp filter
  React.useEffect(() => {
    if (filterIndex !== -1) {
      setTempFilter(filters[filterIndex]);
    } else {
      setTempFilter({
        id: Date.now(),
        parameter: "",
        operator: "eq",
        value: "",
      });
    }
  }, [filters, filterIndex]);

  if (!tempFilter) return null;

  const onChange = (field: string, value: string | string[] | undefined) => {
    setTempFilter((prevFilter: InternalFilter | null) => {
      if (prevFilter === null) {
        return null; // or initialize a new Filter object as appropriate
      }
      // Ensuring all fields of Filter are always defined
      const updatedFilter: InternalFilter = {
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

  const selectedColumn = columns.find((c) => c.id == tempFilter.parameter);

  const columnType = selectedColumn?.type;
  const isCategory = Array.isArray(columnType);
  const isDateTime = columnType === "DateTime";
  const isNumber = columnType === "number";

  const operatorOptions = {
    DateTime: ["last", "gt", "lt"],
    category: ["eq", "neq", "in", "not in", "like"],
    number: ["eq", "neq", "gt", "lt", "in", "not in", "like"],
    default: ["eq", "neq", "gt", "lt", "like"],
  };

  const defaultOperators = {
    DateTime: "last",
    category: "eq",
    number: "eq",
    default: "eq",
  };

  const operatorLabels: { [operator: string]: string } = {
    eq: "equals to",
    neq: "not equals to",
    last: "in the last",
    gt: "is greater than",
    lt: "is lower than",
    in: "is in",
    "not in": "is not in",
    like: "like",
  };

  const getOperatorType = () => {
    if (isDateTime) return "DateTime";
    if (isCategory) return "category";
    if (isNumber) return "number";
    return "default";
  };

  const operatorType = getOperatorType();

  const operators = operatorOptions[operatorType];

  const operatorSelector = (
    <FormControl variant="outlined">
      <InputLabel id="operator">Operator</InputLabel>
      <Select
        value={tempFilter.operator}
        onChange={(e) => {
          const newOperator = e.target.value;
          onChange("operator", newOperator);
          if (["in", "not in"].includes(newOperator)) {
            onChange("values", []);
            onChange("value", undefined);
          } else {
            onChange("value", "");
            onChange("values", undefined);
          }
        }}
        label="Operator"
        labelId="operator"
        data-testid="filter-form-select-operator"
        sx={{ minWidth: 120 }}
      >
        {operators.map((operator) => (
          <MenuItem key={operator} value={operator}>
            {operatorLabels[operator]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const valueSelector = () => {
    if (!tempFilter) return null;

    const isMultiple = ["in", "not in"].includes(tempFilter.operator);
    const selectValue = isMultiple
      ? ((tempFilter.values || []) as string[])
      : ((tempFilter.value || "") as string);

    const handleValueChange = (e: SelectChangeEvent<unknown>) => {
      const value = e.target.value;
      if (isMultiple) {
        onChange("values", value as string[]);
      } else {
        onChange("value", value as string);
      }
    };

    if (isDateTime) {
      if (tempFilter.operator !== "last") {
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
      } else {
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
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
        );
      }
    }

    if (isCategory && tempFilter.operator !== "like") {
      return (
        <FormControl variant="outlined">
          <InputLabel id="value">Value</InputLabel>
          <Select
            label="Value"
            labelId="value"
            value={selectValue}
            onChange={handleValueChange}
            multiple={isMultiple}
            sx={{ minWidth: 100 }}
          >
            {Array.isArray(columnType) &&
              columnType.map((val) => (
                <MenuItem key={val} value={val}>
                  {selectedColumn?.render ? selectedColumn.render(val) : val}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      );
    }

    if (isNumber) {
      if (!["in", "not in", "like"].includes(tempFilter.operator)) {
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
      } else if (isMultiple) {
        return (
          <FormControl variant="outlined">
            <TextField
              id="value"
              variant="outlined"
              label="Value"
              value={(tempFilter.values || []).join(",")}
              onChange={(e) => onChange("values", e.target.value.split(","))}
            />
          </FormControl>
        );
      }
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
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h6" padding={1}>
          Edit Filter
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl variant="outlined">
            <InputLabel id="parameter">Parameter</InputLabel>
            <Select
              value={tempFilter.parameter}
              onChange={(e) => {
                const parameter = e.target.value;
                onChange("parameter", parameter);

                const column = columns.find((v) => v.id === parameter);
                const colType = column?.type;
                const typeKey =
                  colType === "DateTime"
                    ? "DateTime"
                    : Array.isArray(colType)
                      ? "category"
                      : colType === "number"
                        ? "number"
                        : "default";

                const defaultOp = defaultOperators[typeKey];
                onChange("operator", defaultOp);
              }}
              label="Parameter"
              labelId="parameter"
              data-testid="filter-form-select-parameter"
              sx={{ minWidth: 120 }}
            >
              {columns.map((column) => (
                <MenuItem key={String(column.id)} value={column.id}>
                  {column.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {operatorSelector}

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
