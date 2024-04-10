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
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import {
  Alert,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterToolbar } from "./FilterToolbar";
import { Filter } from "@/types/Filter";
import { Column } from "@/types/Column";

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
 * Menu item
 */
export interface MenuItem {
  label: string;
  onClick: (id: number | null) => void;
}

/**
 * DataTable head props
 * @property {Column[]} headCells - the head cells for the table
 * @property {number} numSelected - the number of selected rows
 * @property {function} onRequestSort - the function to call when sorting is requested
 * @property {function} onSelectAllClick - the function to call when all rows are selected
 * @property {Order} order - the order to sort by
 * @property {string} orderBy - the key to sort by
 * @property {number} rowCount - the number of rows
 */
interface DataTableHeadProps {
  headCells: Column[];
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
 * @param {DataTableHeadProps} props - the props for the component
 */
function DataTableHead(props: DataTableHeadProps) {
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
 * @property {string} title - the title of the table
 * @property {number} page - the current page
 * @property {function} setPage - the function to call when the page changes
 * @property {number} rowsPerPage - the number of rows per page
 * @property {function} setRowsPerPage - the function to call when the rows per page change
 * @property {number[]} selected - the selected rows
 * @property {function} setSelected - the function to call when the selected rows change
 * @property {Filter[]} filters - the filters to apply
 * @property {function} setFilters - the function to call when the filters change
 * @property {function} setSearchBody - the function to call when the search body changes
 * @property {Column[]} columns - the columns of the table
 * @property {any[]} rows - the rows of the table
 * @property {string | null} error - the error message
 * @property {string} rowIdentifier - the identifier for the rows
 * @property {boolean} isMobile - whether the table is displayed on a mobile device
 * @property {JSX.Element} toolbarComponents - the components to display in the toolbar
 * @property {MenuItem[]} menuItems - the menu items
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
  setSearchBody: (searchBody: any) => void;
  columns: Column[];
  rows: any[];
  error: string | null;
  rowIdentifier: string;
  isMobile: boolean;
  toolbarComponents: JSX.Element;
  menuItems: MenuItem[];
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
    setSearchBody,
    columns,
    rows,
    error,
    rowIdentifier,
    isMobile,
    toolbarComponents,
    menuItems,
  } = props;
  // State for sorting
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<string | number>(rowIdentifier);
  // State for the context menu
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number | null;
    mouseY: number | null;
    id: number | null;
  }>({ mouseX: null, mouseY: null, id: null });
  // NextJS router and params
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Manage URL search params
  const createQueryString = React.useCallback(
    (filters: Filter[]) => {
      const params = new URLSearchParams(searchParams.toString());
      // Clear existing filters
      params.delete("filter");

      // Append new filters
      filters.forEach((filter) => {
        params.append(
          "filter",
          `${filter.id}_${filter.column}_${filter.operator}_${filter.value}`,
        );
      });

      return params.toString();
    },
    [searchParams],
  );

  const updateFiltersAndUrl = React.useCallback(
    (newFilters: Filter[]) => {
      // Generate the new query string with all filters
      const queryString = createQueryString(newFilters);

      // Push new URL to history without reloading the page
      router.push(pathname + "?" + queryString);
    },
    [createQueryString, pathname, router],
  );

  // Handle the application of filters
  const handleApplyFilters = () => {
    // Transform list of filters into a json object
    const jsonFilters = filters.map((filter) => ({
      parameter: filter.column,
      operator: filter.operator,
      value: filter.value,
    }));
    setSearchBody({ search: jsonFilters });

    // Update the filters in the URL
    updateFiltersAndUrl(filters);
  };

  React.useEffect(() => {
    // Function to parse the filters from the URL search params
    const parseFiltersFromUrl = () => {
      const filterStrings = searchParams.getAll("filter");
      return filterStrings.map((filterString: string) => {
        const [id, column, operator, value] = filterString.split("_");
        return { id: Number(id), column, operator, value };
      });
    };

    if (searchParams.has("filter")) {
      // Parse the filters when the component mounts or when the searchParams change
      const initialFilters = parseFiltersFromUrl();
      // Set the filters (they will be displayed in the UI)
      setFilters(initialFilters);
      // Apply the filters to get the filtered data
      const jsonFilters = initialFilters.map((filter) => ({
        parameter: filter.column,
        operator: filter.operator,
        value: filter.value,
      }));
      setSearchBody({ search: jsonFilters });
    }
  }, [searchParams, setFilters, setSearchBody]);

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

  // Manage context menu
  const handleContextMenu = (event: React.MouseEvent, id: number) => {
    event.preventDefault(); // Prevent default context menu
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      id,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ mouseX: null, mouseY: null, id: null });
  };

  // Wait for the data to load
  if (!rows && !error) {
    const buttonWidth = "calc(20% - 10px)";
    return (
      <Box sx={{ width: "100%", p: 1 }} data-testid="skeleton">
        <Stack direction="row" spacing={1} sx={{ m: 1 }}>
          <Skeleton
            variant="rectangular"
            animation="pulse"
            height={50}
            width={buttonWidth}
          />
          <Skeleton
            variant="rectangular"
            animation="pulse"
            height={50}
            width={buttonWidth}
          />
          <Skeleton
            variant="rectangular"
            animation="pulse"
            height={50}
            width={buttonWidth}
          />
        </Stack>
        <Skeleton
          variant="rectangular"
          animation="pulse"
          height={500}
          width="100%"
        />
      </Box>
    );
  }

  // Handle errors
  if (error) {
    return (
      <Box sx={{ width: "100%", marginTop: 2 }}>
        <Alert severity="error">
          An error occurred while fetching data. Reload the page.
        </Alert>
      </Box>
    );
  }

  // Handle no data
  if (!rows || rows.length === 0) {
    return (
      <>
        <FilterToolbar
          columns={columns}
          filters={filters}
          setFilters={setFilters}
          handleApplyFilters={handleApplyFilters}
        />
        <Box sx={{ width: "100%", marginTop: 2 }}>
          <Alert severity="info">
            No data or no results match your filters.
          </Alert>
        </Box>
      </>
    );
  }

  // Calculate the number of empty rows needed to fill the space
  const emptyRows = Math.min(
    25,
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage),
  );

  return (
    <Box sx={{ width: "100%" }}>
      <FilterToolbar
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleApplyFilters={handleApplyFilters}
      />

      <Paper sx={{ width: "100%", mb: 2 }}>
        <DataTableToolbar
          title={title}
          numSelected={selected.length}
          selectedIds={selected}
          toolbarComponents={toolbarComponents}
        />
        <TableContainer sx={{ maxHeight: "55vh" }}>
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
                      onContextMenu={(event) =>
                        handleContextMenu(event, row[rowIdentifier] as number)
                      }
                      style={{ cursor: "context-menu" }}
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
      <Menu
        open={contextMenu.mouseY !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu.mouseY !== null && contextMenu.mouseX !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {menuItems.map((menuItem, index: number) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleCloseContextMenu();
              menuItem.onClick(contextMenu.id);
            }}
          >
            {menuItem.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
