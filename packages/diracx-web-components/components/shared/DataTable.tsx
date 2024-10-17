"use client";
import React from "react";
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
import { FormatListBulleted } from "@mui/icons-material";
import {
  Alert,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
} from "@mui/material";
import { cyan } from "@mui/material/colors";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import { FilterToolbar } from "./FilterToolbar";
import { InternalFilter } from "@/types/Filter";
import { Column } from "@/types/Column";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { DashboardGroup, SearchBody } from "@/types";

/**
 * Menu item
 */
export interface MenuItem {
  label: string;
  onClick: (id: number | null) => void;
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
            alpha(cyan[500], theme.palette.action.activatedOpacity),
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
              <FormatListBulleted />
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
 * @property {T[]} rows - the rows of the table
 * @property {string | null} error - the error message
 * @property {string} rowIdentifier - the identifier for the rows
 * @property {boolean} isMobile - whether the table is displayed on a mobile device
 * @property {JSX.Element} toolbarComponents - the components to display in the toolbar
 * @property {MenuItem[]} menuItems - the menu items
 */
interface DataTableProps<T extends Record<string, unknown>> {
  /** The title of the table */
  title: string;
  /** The current page */
  page: number;
  /** The function to call when the page changes */
  setPage: React.Dispatch<React.SetStateAction<number>>;
  /** The number of rows per page */
  rowsPerPage: number;
  /** The function to call when the rows per page change */
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  /** The order of the table, either "asc" or "desc" */
  order: "asc" | "desc";
  /** The function to call when the order changes */
  setOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  /** The column to order by */
  orderBy: string | number;
  /** The function to call when the order by changes */
  setOrderBy: React.Dispatch<React.SetStateAction<string | number>>;
  /** The total number of rows */
  totalRows: number;
  /** The selected rows */
  selected: readonly number[];
  /** The function to call when the selected rows change */
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  /** The filters to apply */
  filters: InternalFilter[];
  /** The function to call when the filters change */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  /** The function to call when the search body changes */
  setSearchBody: React.Dispatch<React.SetStateAction<SearchBody>>;
  /** The columns of the table */
  columns: Column[];
  /** The rows of the table */
  rows: T[];
  /** The error message */
  error: string | null;
  /** Whether the table is validating */
  isValidating: boolean;
  /** Whether the table is loading */
  isLoading: boolean;
  /** The identifier for the rows */
  rowIdentifier: keyof T;
  /** Whether the table is displayed on a mobile device */
  isMobile: boolean;
  /** The components to display in the toolbar */
  toolbarComponents: JSX.Element;
  /** The context menu items */
  menuItems: MenuItem[];
}

/**
 * Data table component
 *
 * @returns a DataTable component
 */
export function DataTable<T extends Record<string, unknown>>(
  props: DataTableProps<T>,
) {
  const {
    title,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    totalRows,
    selected,
    setSelected,
    filters,
    setFilters,
    setSearchBody,
    columns,
    rows,
    error,
    isLoading,
    isValidating,
    rowIdentifier,
    isMobile,
    toolbarComponents,
    menuItems,
  } = props;
  // State for the context menu
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number | null;
    mouseY: number | null;
    id: number | null;
  }>({ mouseX: null, mouseY: null, id: null });
  const { getParam, setParam } = useSearchParamsUtils();
  const appId = getParam("appId");

  const [appliedFilters, setAppliedFilters] =
    React.useState<InternalFilter[]>(filters);

  const updateFiltersAndUrl = React.useCallback(
    (newFilters: InternalFilter[]) => {
      // Update the filters in the URL using the setParam function
      setParam(
        "filter",
        newFilters.map(
          (filter) =>
            `${filter.id}_${filter.parameter}_${filter.operator}_${filter.value}`,
        ),
      );
    },
    [setParam],
  );

  const [userDashboard, setUserDashboard] =
    React.useContext(ApplicationsContext);
  const updateGroupFilters = React.useCallback(
    (newFilters: InternalFilter[]) => {
      const appId = getParam("appId");

      const group = userDashboard.find((group) =>
        group.items.some((item) => item.id === appId),
      );
      if (group) {
        const newGroup = {
          ...group,
          items: group.items.map((item) => {
            if (item.id === appId) {
              return { ...item, data: newFilters };
            }
            return item;
          }),
        };
        setUserDashboard((groups: DashboardGroup[]) =>
          groups.map((s) => (s.title === group.title ? newGroup : s)),
        );
      }
    },
    [getParam, userDashboard, setUserDashboard],
  );

  // Handle the application of filters
  const handleApplyFilters = () => {
    // Transform list of internal filters into filters
    const jsonFilters = filters.map((filter) => ({
      parameter: filter.parameter,
      operator: filter.operator,
      value: filter.value,
      values: filter.values,
    }));
    setSearchBody({ search: jsonFilters });
    setPage(0);
    setAppliedFilters(filters);

    // Update the filters in the URL
    updateFiltersAndUrl(filters);
    // Update the filters in the groups
    updateGroupFilters(filters);
  };

  const DashboardItem = React.useMemo(
    () =>
      userDashboard
        .find((group) => group.items.some((item) => item.id === appId))
        ?.items.find((item) => item.id === appId),
    [appId, userDashboard],
  );

  React.useEffect(() => {
    if (DashboardItem?.data) {
      setFilters(DashboardItem.data);
      setAppliedFilters(DashboardItem.data);
      const jsonFilters = DashboardItem.data.map((filter: InternalFilter) => ({
        parameter: filter.parameter,
        operator: filter.operator,
        value: filter.value,
        values: filter.values,
      }));
      setSearchBody({ search: jsonFilters });
    } else {
      setFilters([]);
      setSearchBody({ search: [] });
    }
  }, [DashboardItem?.data, setFilters, setSearchBody]);

  // Manage sorting
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setSearchBody((prevState: SearchBody) => ({
      ...prevState,
      sort: [{ parameter: property, direction: isAsc ? "desc" : "asc" }],
    }));
  };

  // Manage selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n: T) => n[rowIdentifier] as number);
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

  // Virtuoso table components: https://virtuoso.dev/
  // Used to render large tables with virtualization, which improves performance
  interface TableContextProps {
    rowIdentifier: keyof T;
    handleClick: (event: React.MouseEvent, id: number) => void;
    handleContextMenu: (event: React.MouseEvent, id: number) => void;
    isSelected: (id: number) => boolean;
    isMobile: boolean;
  }

  interface TableRowProps {
    item: T;
    context?: TableContextProps;
    "data-index"?: number;
  }

  const VirtuosoTableComponents: TableComponents<T, TableContextProps> = {
    Scroller: React.forwardRef<HTMLDivElement>(function Scroller(props, ref) {
      return <TableContainer component={Paper} {...props} ref={ref} />;
    }),
    Table: function VirtuosoTable(props) {
      const { isMobile } = props.context as TableContextProps;
      return (
        <Table
          {...props}
          sx={{
            borderCollapse: "separate",
            tableLayout: "fixed",
            minWidth: isMobile ? "undefined" : "50vw",
          }}
          aria-labelledby="tableTitle"
          size={"small"}
        />
      );
    },
    TableHead: React.forwardRef<HTMLTableSectionElement>(
      function VirtuosoTableHead(props, ref) {
        return <TableHead {...props} ref={ref} />;
      },
    ),
    TableRow: function VirtuosoTableRow(props: TableRowProps) {
      const { item, context } = props;

      if (!context) {
        return <TableRow {...props} />;
      }

      const { rowIdentifier, handleClick, handleContextMenu, isSelected } =
        context || {};

      const itemId = item[rowIdentifier];
      if (typeof itemId !== "number") {
        return <TableRow {...props} />;
      }

      return (
        <TableRow
          {...props}
          hover
          onClick={(event) => handleClick(event, itemId)}
          role="checkbox"
          aria-checked={isSelected(itemId)}
          tabIndex={-1}
          key={itemId}
          selected={isSelected(itemId)}
          onContextMenu={(event) => handleContextMenu(event, itemId)}
          style={{ cursor: "context-menu" }}
        />
      );
    },
    TableBody: React.forwardRef<HTMLTableSectionElement>(
      function VirtuosoTableBody(props, ref) {
        return <TableBody {...props} ref={ref} />;
      },
    ),
  };

  // Wait for the data to load
  if (isValidating || isLoading) {
    return (
      <>
        <FilterToolbar
          columns={columns}
          filters={filters}
          setFilters={setFilters}
          appliedFilters={appliedFilters}
          handleApplyFilters={handleApplyFilters}
        />
        <Box sx={{ width: "100%", p: 1 }} data-testid="skeleton">
          <Skeleton
            variant="rectangular"
            animation="pulse"
            height={500}
            width="100%"
          />
        </Box>
      </>
    );
  }

  // Handle errors
  if (error) {
    return (
      <>
        <FilterToolbar
          columns={columns}
          filters={filters}
          setFilters={setFilters}
          appliedFilters={appliedFilters}
          handleApplyFilters={handleApplyFilters}
        />
        <Box sx={{ width: "100%", marginTop: 2 }}>
          <Alert severity="error">
            An error occurred while fetching data. Reload the page.
          </Alert>
        </Box>
      </>
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
          appliedFilters={appliedFilters}
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

  return (
    <Box sx={{ width: "100%" }}>
      <FilterToolbar
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        appliedFilters={appliedFilters}
        handleApplyFilters={handleApplyFilters}
      />

      <Paper sx={{ width: "100%", mb: 1 }}>
        <DataTableToolbar
          title={title}
          numSelected={selected.length}
          selectedIds={selected}
          toolbarComponents={toolbarComponents}
        />
        <TableContainer sx={{ height: "65vh", width: "100%" }}>
          <TableVirtuoso<T, TableContextProps>
            data={rows}
            components={VirtuosoTableComponents}
            context={{
              rowIdentifier,
              handleClick,
              handleContextMenu,
              isSelected,
              isMobile,
            }}
            fixedHeaderContent={() => {
              const createSortHandler =
                (property: string) => (event: React.MouseEvent<unknown>) => {
                  handleRequestSort(event, property);
                };

              return (
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 && selected.length < rows.length
                      }
                      checked={
                        rows.length > 0 && selected.length === rows.length
                      }
                      onChange={handleSelectAllClick}
                      inputProps={{ "aria-label": "select all items" }}
                    />
                  </TableCell>
                  {columns.map((headCell) => (
                    <TableCell
                      key={String(headCell.id)}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={createSortHandler(String(headCell.id))}
                      >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === "desc"
                              ? "sorted descending"
                              : "sorted ascending"}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              );
            }}
            itemContent={(index: number, row: T) => {
              const isItemSelected = isSelected(row[rowIdentifier] as number);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <>
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
                      <TableCell key={String(column.id)}>
                        {column.render
                          ? column.render(cellValue)
                          : String(cellValue)}
                      </TableCell>
                    );
                  })}
                </>
              );
            }}
          />
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 500, 1000]}
          component="div"
          count={totalRows}
          showFirstButton
          showLastButton
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
