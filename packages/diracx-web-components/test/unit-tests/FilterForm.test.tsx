import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { FilterForm } from "@/components/ui/FilterForm";

describe("FilterForm", () => {
  const columns = [
    { id: "column1", label: "Column 1" },
    { id: "column2", label: "Column 2" },
    { id: "column3", label: "Column 3" },
  ];
  const filters = [
    { id: 1, column: "column1", operator: "eq", value: "value1" },
    { id: 2, column: "column2", operator: "neq", value: "value2" },
  ];
  const setFilters = jest.fn();
  const handleFilterChange = jest.fn();
  const handleFilterMenuClose = jest.fn();

  it("renders the filter form with correct initial values", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={null}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-column");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value");

    expect(columnSelect).not.toHaveTextContent();
    expect(operatorSelect).toHaveTextContent("equals to");
    expect(valueInput.value).not.toBe();
  });

  it("renders the filter form with correct initial values when a filter is selected", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={1}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-column");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value");

    expect(columnSelect).toHaveTextContent("Column 1");
    expect(operatorSelect).toHaveTextContent("equals to");
    expect(valueInput.value).toBe("value1");
  });

  it("updates the selected filter when fields are changed", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={2}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-column");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value");

    expect(columnSelect).toHaveTextContent("Column 2");
    expect(operatorSelect).toHaveTextContent("not equals to");
    expect(valueInput.value).toBe("value2");

    // Simulate a click event on the column Select element
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);

    // Select the desired option from the dropdown list
    const columnOption = screen.getByText("Column 3");
    fireEvent.click(columnOption);

    // Simulate a click event on the operator Select element
    const operatorButton = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(operatorButton);

    // Select the desired option from the dropdown list
    const operatorOption = screen.getByText("is greater than");
    fireEvent.click(operatorOption);

    // Simulate a change event on the value input element
    fireEvent.change(valueInput, { target: { value: "value3" } });

    expect(columnSelect).toHaveTextContent("Column 3");
    expect(operatorSelect).toHaveTextContent("is greater than");
    expect(valueInput.value).toBe("value3");
  });

  it("calls setFilters when applyChanges is clicked with a new filter", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={null}
      />,
    );

    const applyChangesButton = screen.getByLabelText("Finish editing filter");

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalledWith([
      ...filters,
      { id: expect.any(Number), column: "", operator: "eq", value: "" },
    ]);
    expect(handleFilterChange).not.toHaveBeenCalled();
    expect(handleFilterMenuClose).toHaveBeenCalled();
  });

  it("calls handleFilterChange when applyChanges is clicked with an existing filter", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={1}
      />,
    );

    const applyChangesButton = screen.getByLabelText("Finish editing filter");

    // Simulate a click event on the column Select element
    const columnSelect = screen.getByTestId("filter-form-select-column");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);

    // Select the desired option from the dropdown list
    const columnOption = screen.getByText("Column 3");
    fireEvent.click(columnOption);

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalled();
    expect(handleFilterChange).toHaveBeenCalledWith(0, {
      id: 1,
      column: "column3",
      operator: "eq",
      value: "value1",
    });
    expect(handleFilterMenuClose).toHaveBeenCalled();
  });
});
