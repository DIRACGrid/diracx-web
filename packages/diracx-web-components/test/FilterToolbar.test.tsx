import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FilterToolbar } from "../src/components/shared/FilterToolbar";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

// Define the item type for the table
interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  description: string;
}

describe("FilterToolbar", () => {
  // Define the columns for the table
  const columnHelper = createColumnHelper<SimpleItem>();

  const columnDefs = [
    columnHelper.accessor("id", {
      header: "ID",
      meta: { type: "number" },
    }),
    columnHelper.accessor("name", {
      header: "Name",
      meta: { type: "string" },
    }),
    columnHelper.accessor("description", {
      header: "Description",
      meta: { type: "string" },
    }),
  ];

  // Create mock data for the table
  const data: SimpleItem[] = [
    { id: 1, name: "Item 1", description: "Description 1" },
    { id: 2, name: "Item 2", description: "Description 2" },
  ];

  // Create mock filters
  const filters = [
    {
      id: 1,
      parameter: "id",
      operator: "eq",
      value: "value1",
      isApplied: true,
    },
    {
      id: 2,
      parameter: "name",
      operator: "neq",
      value: "value2",
      isApplied: false,
    },
  ];

  const setFilters = jest.fn();
  const handleApplyFilters = jest.fn();
  const handleClearFilters = jest.fn();

  // Wrapper component to initialize the table
  const FilterToolbarWrapper: React.FC = () => {
    const table = useReactTable<SimpleItem>({
      data,
      columns: columnDefs,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <ThemeProvider>
        <FilterToolbar<SimpleItem>
          columns={table.getAllColumns()}
          filters={filters}
          setFilters={setFilters}
          handleApplyFilters={handleApplyFilters}
          handleClearFilters={handleClearFilters}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    render(<FilterToolbarWrapper />);
  });

  it("renders the filter toolbar with correct buttons", () => {
    const addFilterButton = screen.getByText("Add filter");
    const applyFiltersButton = screen.getByText("Apply filters");
    const clearAllFiltersButton = screen.getByText("Clear all filters");

    expect(addFilterButton).toBeInTheDocument();
    expect(applyFiltersButton).toBeInTheDocument();
    expect(clearAllFiltersButton).toBeInTheDocument();

    const idFilter = screen.getByText("id eq value1").closest("div");
    const nameFilter = screen.getByText("name neq value2").closest("div");

    expect(idFilter).toBeInTheDocument();
    expect(nameFilter).toBeInTheDocument();

    expect(idFilter).toHaveClass("chip-filter-applied");
    expect(nameFilter).toHaveClass("chip-filter-unapplied");
  });

  it("renders the warning when there are unapplied filters", () => {
    const warningMessage = screen.getByText(
      'Some filter changes have not been applied. Please click on "Apply filters" to update your results.',
    );

    expect(warningMessage).toBeInTheDocument();

    filters[1].isApplied = true;

    cleanup();

    render(<FilterToolbarWrapper />);

    expect(warningMessage).not.toBeInTheDocument();
    filters[1].isApplied = false;
  });

  it("opens the filter form when 'Add filter' button is clicked", () => {
    const addFilterButton = screen.getByText("Add filter");

    fireEvent.click(addFilterButton);

    const filterForm = screen.getByRole("presentation");

    expect(filterForm).toBeInTheDocument();
  });

  it("applies filters when 'Apply filters' button is clicked", async () => {
    const applyFiltersButton = screen.getByText("Apply filters");

    fireEvent.click(applyFiltersButton);

    expect(handleApplyFilters).toHaveBeenCalled();
  });

  it("removes a filter when the corresponding 'Delete' button is clicked", () => {
    const deleteFilterButton = screen.getAllByTestId("CancelIcon")[0];

    fireEvent.click(deleteFilterButton);

    expect(setFilters).toHaveBeenCalledWith([filters[1]]);
  });
});
