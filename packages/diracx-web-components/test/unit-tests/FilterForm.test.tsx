import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { FilterForm } from "@/components/shared/FilterForm";
import { Column } from "@/types/Column";

describe("FilterForm", () => {
  const columns: Column[] = [
    { id: "column1", label: "Column 1" },
    { id: "column2", label: "Column 2" },
    { id: "column3", label: "Column 3" },
    { id: "column4", label: "Column 4", type: ["1", "2", "3"] },
    { id: "column5", label: "Column 5", type: "DateTime" },
  ];
  const filters = [
    { id: 1, parameter: "column1", operator: "eq", value: "value1" },
    { id: 2, parameter: "column2", operator: "neq", value: "value2" },
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
        selectedFilterId={undefined}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

    expect(columnSelect).not.toHaveTextContent("Column");
    expect(operatorSelect).toHaveTextContent("equals to");
    expect(valueInput.value).not.toBe("value1");
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

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

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

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const valueInput = screen.getByLabelText("Value") as HTMLInputElement;

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
        selectedFilterId={undefined}
      />,
    );

    const applyChangesButton = screen.getByLabelText("Finish editing filter");

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalledWith([
      ...filters,
      { id: expect.any(Number), parameter: "", operator: "eq", value: "" },
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
    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);

    // Select the desired option from the dropdown list
    const columnOption = screen.getByText("Column 3");
    fireEvent.click(columnOption);

    fireEvent.click(applyChangesButton);

    expect(setFilters).toHaveBeenCalled();
    expect(handleFilterChange).toHaveBeenCalledWith(0, {
      id: 1,
      parameter: "column3",
      operator: "eq",
      value: "value1",
    });
    expect(handleFilterMenuClose).toHaveBeenCalled();
  });

  it("renders the correct input for DateTime column type", () => {
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={undefined}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);
    const columnOption = screen.getByText("Column 5");
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
    render(
      <FilterForm
        columns={columns}
        filters={filters}
        setFilters={setFilters}
        handleFilterChange={handleFilterChange}
        handleFilterMenuClose={handleFilterMenuClose}
        selectedFilterId={undefined}
      />,
    );

    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const columnButton = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(columnButton);
    const columnOption = screen.getByText("Column 4");
    fireEvent.click(columnOption);

    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const operatorButton = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(operatorButton);
    const operatorOption = screen.getByText("is in");
    fireEvent.click(operatorOption);

    const valueSelect = screen.getByLabelText("Value");
    expect(valueSelect).toHaveRole("combobox");
    fireEvent.mouseDown(valueSelect);

    const valueOption1 = screen.getByText("1");
    fireEvent.click(valueOption1);
    const valueOption2 = screen.getByText("2");
    fireEvent.click(valueOption2);

    expect(valueSelect).toHaveTextContent("1, 2");
  });
});
