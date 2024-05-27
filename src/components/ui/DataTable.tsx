"use client";
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
import { useSearchParams } from "next/navigation";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import { FilterToolbar } from "./FilterToolbar";
import { Filter } from "@/types/Filter";
import { Column } from "@/types/Column";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";

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

interface TableContextProps {
  rowIdentifier: string;
  handleClick: (event: React.MouseEvent, id: number) => void;
  handleContextMenu: (event: React.MouseEvent, id: number) => void;
  isSelected: (id: number) => boolean;
  isMobile: boolean;
}

// Virtuoso table components: https://virtuoso.dev/
// Used to render large tables with virtualization, which improves performance
const VirtuosoTableComponents: TableComponents<Record<string, any>> = {
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
  TableRow: function VirtuosoTableRow({
    item,
    ...props
  }: {
    item: Record<string, any>;
    [key: string]: any;
  }) {
    const { rowIdentifier, handleClick, handleContextMenu, isSelected } =
      props.context as TableContextProps;

    if (item) {
      return (
        <TableRow
          {...props}
          hover
          onClick={(event) => handleClick(event, item[rowIdentifier])}
          role="checkbox"
          aria-checked={isSelected(item[rowIdentifier])}
          tabIndex={-1}
          key={item[rowIdentifier]}
          selected={isSelected(item[rowIdentifier])}
          onContextMenu={(event) =>
            handleContextMenu(event, item[rowIdentifier])
          }
          style={{ cursor: "context-menu" }}
        />
      );
    }
    return <TableRow {...props} />;
  },
  TableBody: React.forwardRef<HTMLTableSectionElement>(
    function VirtuosoTableBody(props, ref) {
      return <TableBody {...props} ref={ref} />;
    },
  ),
};

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
  order: "asc" | "desc";
  setOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  orderBy: string | number;
  setOrderBy: React.Dispatch<React.SetStateAction<string | number>>;
  totalRows: number;
  selected: readonly number[];
  setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  setSearchBody: (searchBody: any) => void;
  columns: Column[];
  rows: any[];
  error: string | null;
  isValidating: boolean;
  isLoading: boolean;
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
  // NextJS router and params
  const searchParams = useSearchParams();
  const { getParam, setParam } = useSearchParamsUtils();
  const appId = getParam("appId");

  const updateFiltersAndUrl = React.useCallback(
    (newFilters: Filter[]) => {
      // Update the filters in the URL using the setParam function
      setParam(
        "filter",
        newFilters.map(
          (filter) =>
            `${filter.id}_${filter.column}_${filter.operator}_${filter.value}`,
        ),
      );
    },
    [setParam],
  );

  const [sections, setSections] = React.useContext(ApplicationsContext);
  const updateSectionFilters = React.useCallback(
    (newFilters: Filter[]) => {
      const appId = getParam("appId");

      const section = sections.find((section) =>
        section.items.some((item) => item.id === appId),
      );
      if (section) {
        const newSection = {
          ...section,
          items: section.items.map((item) => {
            if (item.id === appId) {
              return { ...item, data: { filters: newFilters } };
            }
            return item;
          }),
        };
        setSections((sections) =>
          sections.map((s) => (s.title === section.title ? newSection : s)),
        );
      }
    },
    [getParam, sections, setSections],
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
    setPage(0);

    // Update the filters in the URL
    updateFiltersAndUrl(filters);
    // Update the filters in the sections
    updateSectionFilters(filters);
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

    const item = sections
      .find((section) => section.items.some((item) => item.id === appId))
      ?.items.find((item) => item.id === appId);

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
    } else if (item?.data?.filters) {
      setFilters(item.data.filters);
      const jsonFilters = item.data.filters.map(
        (filter: {
          id: number;
          column: string;
          operator: string;
          value: string;
        }) => ({
          parameter: filter.column,
          operator: filter.operator,
          value: filter.value,
        }),
      );
      setSearchBody({ search: jsonFilters });
    } else {
      setFilters([]);
      setSearchBody({ search: [] });
    }
  }, [appId, searchParams, sections, setFilters, setSearchBody]);

  // Manage sorting
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string | number,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setSearchBody((prevState: any) => ({
      ...prevState,
      sort: [{ parameter: property, direction: isAsc ? "desc" : "asc" }],
    }));
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
  if ((!rows && !error) || isValidating || isLoading) {
    return (
      <>
        <FilterToolbar
          columns={columns}
          filters={filters}
          setFilters={setFilters}
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
          <TableVirtuoso
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
                (property: string | number) =>
                (event: React.MouseEvent<unknown>) => {
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
            itemContent={(index: number, row: Record<string, any>) => {
              const isItemSelected = isSelected(row[rowIdentifier]);
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
                      <TableCell key={column.id}>
                        {column.render ? column.render(cellValue) : cellValue}
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
