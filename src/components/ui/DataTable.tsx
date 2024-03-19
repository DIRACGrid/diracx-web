import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * Descending comparator function
 * @param a - the first value to compare
 * @param b - the second value to compare
 * @param orderBy - the key to compare
 * @returns -1 if b is less than a, 1 if b is greater than a, 0 if they are equal
 * @template T - the type of the values to compare
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

/**
 * Get the comparator function for a given key and order
 * @param order - the order to sort by
 * @param orderBy - the key to sort by
 * @returns a comparator function
 * @template Key - the type of the key to sort by
 */
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Stable sort function
 * @param array - the array to sort
 * @param comparator - the comparator function
 * @returns the sorted array
 * @template T - the type of the array to sort
 */
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

/**
 * The head cells for the table.
 * Components using this table should provide a list of head cells.
 * @property {number | string} id - the id of the cell
 * @property {string} label - the label of the cell
 */
export interface HeadCell {
  id: number | string;
  label: string;
  render?: ((value: any) => JSX.Element) | null;
}

/** Filter form
 * @property {number} id - the id of the filter
 * @property {string} column - the column to filter by
 * @property {string} operator - the operator to use for the filter
 * @property {string} value - the value to filter by
 */
export interface Filter {
  id: number;
  column: string;
  operator: string;
  value: string;
}

/**
 * Enhanced table props
 * @property {HeadCell[]} headCells - the head cells for the table
 * @property {number} numSelected - the number of selected rows
 * @property {function} onRequestSort - the function to call when sorting is requested
 * @property {function} onSelectAllClick - the function to call when all rows are selected
 * @property {Order} order - the order to sort by
 * @property {string} orderBy - the key to sort by
 * @property {number} rowCount - the number of rows
 */
interface EnhancedTableProps {
  headCells: HeadCell[];
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: string | number,
  ) => void;
  onSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

/**
 * Data table head component
 * @param {EnhancedTableProps} props - the props for the component
 */
function DataTableHead(props: EnhancedTableProps) {
  const {
    headCells,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: string | number) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all items" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface FilterFormProps {
  columns: any[];
  handleFilterChange: (index: number, tempFilter: Filter) => void;
  handleFilterMenuClose: () => void;
  filters: Filter[];
  selectedFilterId: number | undefined;
}

function FilterForm(props: FilterFormProps) {
  const {
    columns,
    filters,
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
      setTempFilter(null);
    }
  }, [filters, filterIndex]);

  if (filterIndex === -1 || !tempFilter) return null;

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
    handleFilterChange(filterIndex, tempFilter);
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
            <InputLabel>Column</InputLabel>
            <Select
              value={tempFilter.column}
              onChange={(e) => onChange("column", e.target.value)}
              label="Column"
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
            <InputLabel>Operator</InputLabel>
            <Select
              value={tempFilter.operator}
              onChange={(e) => onChange("operator", e.target.value)}
              label="Operator"
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
              variant="outlined"
              label="Value"
              value={tempFilter.value}
              onChange={(e) => onChange("value", e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </FormControl>

          <Tooltip title="Finish editing filter">
            <IconButton onClick={() => applyChanges()} color="success">
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 */
interface FilterToolbarProps {
  columns: HeadCell[];
  filters: Filter[];
  handleAddFilter: () => void;
  handleRemoveFilter: (index: number) => void;
  handleRemoveAllFilters: () => void;
  handleApplyFilters: () => void;
  handleFilterChange: (index: number, tempFilter: Filter) => void;
}

/**
 * Filter toolbar component
 * @param {FilterToolbarProps} props - the props for the component
 * @returns a FilterToolbar component
 */
function FilterToolbar(props: FilterToolbarProps) {
  const {
    columns,
    filters,
    handleAddFilter,
    handleRemoveFilter,
    handleRemoveAllFilters,
    handleApplyFilters,
    handleFilterChange,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState<Filter | null>(
    null,
  );

  const open = Boolean(anchorEl);

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ m: 1 }}>
        <Button
          variant="text"
          startIcon={<FilterListIcon />}
          onClick={handleAddFilter}
        >
          <span>Add filter</span>
        </Button>
        <Button
          variant="text"
          startIcon={<SendIcon />}
          onClick={handleApplyFilters}
        >
          <span>Apply filters</span>
        </Button>
        <Button
          variant="text"
          startIcon={<DeleteIcon />}
          onClick={handleRemoveAllFilters}
        >
          <span>Clear all filters</span>
        </Button>
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
            selectedFilterId={selectedFilter?.id}
          />
        </Popover>
      </Stack>
    </>
  );
}

/**
 * Data table toolbar props
 * @property {string} title - the title of the table
 * @property {number} numSelected - the number of selected rows
 * @property {number[]} selectedIds - the ids of the selected rows
 * @property {function} clearSelected - the function to call when the selected rows are cleared
 */
interface DataTableToolbarProps {
  title: string;
  numSelected: number;
  selectedIds: readonly number[];
  toolbarComponents: JSX.Element;
}

/**
 * Data table toolbar component
 * @param {DataTableToolbarProps} props - the props for the component
 */
function DataTableToolbar(props: DataTableToolbarProps) {
  const { title, numSelected, selectedIds, toolbarComponents } = props;
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  /**
   * Handle the copy of the selected IDs
   */
  const handleCopyIDs = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedIds)).then(
      () => {
        setSnackbarOpen(true); // Open the snackbar on successful copy
      },
      (err) => {
        console.error("Could not copy text: ", err);
      },
    );
  };

  /**
   * Handle the filter menu
   */
  return (
    <Toolbar
      sx={{
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(deepOrange[500], theme.palette.action.activatedOpacity),
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
      {numSelected > 0 ? (
        <Stack direction="row">
          <Tooltip title="Get IDs">
            <IconButton onClick={handleCopyIDs}>
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message="Job IDs copied to clipboard"
          />
          {toolbarComponents}
        </Stack>
      ) : (
        <></>
      )}
    </Toolbar>
  );
}

/**
 * Data table props
 * @property {HeadCell[]} columns - the columns for the table
 * @property {any[]} rows - the rows for the table
 */
interface DataTableProps {
  title: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  selected: readonly number[];
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  handleApplyFilters: () => void;
  columns: HeadCell[];
  rows: any[];
  rowIdentifier: string;
  isMobile: boolean;
  toolbarComponents: JSX.Element;
}

/**
 * Data table component
 * @param {DataTableProps} props - the props for the component
 * @returns a DataTable component
 */
export function DataTable(props: DataTableProps) {
  const {
    title,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    selected,
    setSelected,
    filters,
    setFilters,
    handleApplyFilters,
    columns,
    rows,
    rowIdentifier,
    isMobile,
    toolbarComponents,
  } = props;
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<string | number>(rowIdentifier);

  const [selectedFilter, setSelectedFilter] = React.useState<Filter | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // Manage sorting
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string | number,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Manage selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n: any) => n[rowIdentifier]);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // Manage pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: number) => selected.indexOf(name) !== -1;

  // Calculate the number of empty rows needed to fill the space
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  // Manage filters
  const handleAddFilter = () => {
    const initialFilter = {
      id: Date.now(),
      column: "",
      operator: "eq",
      value: "",
    };
    setFilters([...filters, initialFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleRemoveAllFilters = () => {
    setFilters([]);
  };

  const handleFilterChange = (index: number, newFilter: Filter) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? newFilter : filter,
    );
    setFilters(updatedFilters);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FilterToolbar
        columns={columns}
        filters={filters}
        handleAddFilter={handleAddFilter}
        handleRemoveFilter={handleRemoveFilter}
        handleRemoveAllFilters={handleRemoveAllFilters}
        handleApplyFilters={handleApplyFilters}
        handleFilterChange={handleFilterChange}
      />

      <Paper sx={{ width: "100%", mb: 2 }}>
        <DataTableToolbar
          title={title}
          numSelected={selected.length}
          selectedIds={selected}
          toolbarComponents={toolbarComponents}
        />
        <TableContainer sx={{ maxHeight: "65vh" }}>
          <Table
            stickyHeader
            sx={{ minWidth: isMobile ? "undefined" : "50vw" }}
            aria-labelledby="tableTitle"
            size={"medium"}
          >
            <DataTableHead
              headCells={columns}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy.toString()}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(
                    row[rowIdentifier] as number,
                  );
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) =>
                        handleClick(event, row[rowIdentifier] as number)
                      }
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row[rowIdentifier]}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      {columns.map((column) => {
                        const cellValue = row[column.id];
                        return (
                          <TableCell key={column.id}>
                            {column.render
                              ? column.render(cellValue)
                              : cellValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length + 1} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 500, 1000]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isMobile ? "" : "Rows per page"}
        />
      </Paper>
    </Box>
  );
}
