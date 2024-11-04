import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FilterForm } from "../src/components/shared/FilterForm";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

// Define the item type for the table
interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  date: Date;
  category: string;
}

describe("FilterForm", () => {
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
    columnHelper.accessor("category", {
      header: "Category",
      meta: { type: "category", values: ["A", "B", "C"] }, // Example of a category column
    }),
    columnHelper.accessor("date", {
      header: "Date",
      meta: { type: "date" }, // Example of a DateTime column
    }),
  ];

  // Create mock data for the table
  const data: SimpleItem[] = [
    { id: 1, name: "Item 1", category: "A", date: new Date() },
    { id: 2, name: "Item 2", category: "B", date: new Date() },
  ];

  // Mock filters
  const filters = [
    { id: 1, parameter: "id", operator: "eq", value: "4" },
    { id: 2, parameter: "name", operator: "neq", value: "value2" },
  ];
  const setFilters = jest.fn();
  const handleFilterChange = jest.fn();
  const handleFilterMenuClose = jest.fn();

  // Wrapper component to initialize the table
  interface FilterFormWrapperProps {
    selectedFilterId: number | undefined;
  }

  const FilterFormWrapper: React.FC<FilterFormWrapperProps> = ({
    selectedFilterId,
  }) => {
    const table = useReactTable<SimpleItem>({
      data,
      columns: columnDefs,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <ThemeProvider>
        <FilterForm<SimpleItem>
          columns={table.getAllColumns()}
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          handleFilterMenuClose={handleFilterMenuClose}
          selectedFilterId={selectedFilterId}
        />
      </ThemeProvider>
    );
  };

  it("renders the filter form with correct initial values", () => {
    render(<FilterFormWrapper selectedFilterId={undefined} />);

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

    expect(columnSelect).not.toHaveTextContent("ID");
    expect(operatorSelect).toHaveTextContent("equals to");
    expect(valueInput.value).not.toBe("value1");
  });

  it("renders the filter form with correct initial values when a filter is selected", () => {
    render(<FilterFormWrapper selectedFilterId={1} />);

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

    expect(columnSelect).toHaveTextContent("ID");
    expect(operatorSelect).toHaveTextContent("equals to");
    expect(valueInput.value).toBe("4");
  });

  it("updates the selected filter when fields are changed", () => {
    render(<FilterFormWrapper selectedFilterId={2} />);

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

    expect(columnSelect).toHaveTextContent("Name");
    expect(operatorSelect).toHaveTextContent("not equals to");
    expect(valueInput.value).toBe("value2");

    // Simulate a click event on the column Select element
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);

    // Select the desired option from the dropdown list
    const columnOption = screen.getByText("ID");
    fireEvent.click(columnOption);

    // Simulate a click event on the operator Select element
    const operatorButton = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(operatorButton);

    // Select the desired option from the dropdown list
    const operatorOption = screen.getByText("is greater than");
    fireEvent.click(operatorOption);

    // Simulate a change event on the value input element
    fireEvent.change(valueInput, { target: { value: "5" } });

    expect(columnSelect).toHaveTextContent("ID");
    expect(operatorSelect).toHaveTextContent("is greater than");
    expect(valueInput.value).toBe("5");
  });

  it("calls setFilters when applyChanges is clicked with a new filter", () => {
    render(<FilterFormWrapper selectedFilterId={undefined} />);

    const applyChangesButton = screen.getByText("Add");

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalledWith([
      ...filters,
      { id: expect.any(Number), parameter: "", operator: "eq", value: "" },
    ]);
    expect(handleFilterChange).not.toHaveBeenCalled();
    expect(handleFilterMenuClose).toHaveBeenCalled();
  });

  it("calls handleFilterChange when applyChanges is clicked with an existing filter", () => {
    render(<FilterFormWrapper selectedFilterId={1} />);

    const applyChangesButton = screen.getByText("Add");

    // Simulate a click event on the column Select element
    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);

    // Select the desired option from the dropdown list
    const columnOption = screen.getByText("Category");
    fireEvent.click(columnOption);

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalled();
    expect(handleFilterChange).toHaveBeenCalledWith(0, {
      id: 1,
      parameter: "category",
      operator: "eq",
      value: "",
    });
    expect(handleFilterMenuClose).toHaveBeenCalled();
  });

  it("renders the correct input for DateTime column type", () => {
    render(<FilterFormWrapper selectedFilterId={undefined} />);

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);
    const columnOption = screen.getByText("Date");
    fireEvent.click(columnOption);

    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    expect(operatorSelect).toHaveTextContent("in the last");

    const dateTimeInput = screen.getByLabelText("Value");

    expect(dateTimeInput).toHaveRole("combobox");

    // Simulate a click event on the operator Select element
    const operatorButton = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(operatorButton);

    // Select the desired option from the dropdown list
    const operatorOption = screen.getByText("is greater than");
    fireEvent.click(operatorOption);

    expect(screen.getByTestId("CalendarIcon")).toBeInTheDocument();
  });

  it("handles 'in' and 'not in' operators for category columns", () => {
    render(<FilterFormWrapper selectedFilterId={undefined} />);

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);
    const columnOption = screen.getByText("Category");
    fireEvent.click(columnOption);

    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const operatorButton = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(operatorButton);
    const operatorOption = screen.getByText("is in");
    fireEvent.click(operatorOption);

    const valueSelect = screen.getByLabelText("Value");
    expect(valueSelect).toHaveRole("combobox");
    fireEvent.mouseDown(valueSelect);

    const valueOption1 = screen.getByText("A");
    fireEvent.click(valueOption1);
    const valueOption2 = screen.getByText("B");
    fireEvent.click(valueOption2);

    expect(valueSelect).toHaveTextContent("A, B");
  });
});
