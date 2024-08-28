import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material";
import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useMUITheme } from "@/hooks/theme";

describe("FilterToolbar", () => {
  const columns = [
    { id: "column1", label: "Column 1" },
    { id: "column2", label: "Column 2" },
    { id: "column3", label: "Column 3" },
  ];
  const filters = [
    { id: 1, column: "column1", operator: "eq", value: "value1" },
    { id: 2, column: "column2", operator: "neq", value: "value2" },
  ];
  const appliedFilters = [
    { id: 1, column: "column1", operator: "eq", value: "value1" },
  ];
  const setFilters = jest.fn();
  const handleApplyFilters = jest.fn();

  beforeEach(() => {
    render(
      <ThemeProvider>
        <MUIProviders>
          <FilterToolbar
            columns={columns}
            filters={filters}
            setFilters={setFilters}
            handleApplyFilters={handleApplyFilters}
            appliedFilters={appliedFilters}
          />
        </MUIProviders>
      </ThemeProvider>,
    );
  });

  it("renders the filter toolbar with correct buttons", () => {
    const addFilterButton = screen.getByText("Add filter");
    const applyFiltersButton = screen.getByText("Apply filters");
    const clearAllFiltersButton = screen.getByText("Clear all filters");

    expect(addFilterButton).toBeInTheDocument();
    expect(applyFiltersButton).toBeInTheDocument();
    expect(clearAllFiltersButton).toBeInTheDocument();
  });

  it("renders the chip with chipColor when the filter is applied", () => {
    const chipApplied = screen.getByText("column1 eq value1").closest("div");
    const chipUnapplied = screen.getByText("column2 neq value2").closest("div");

    expect(chipApplied).toHaveClass("MuiChip-colorChipColor");
    expect(chipUnapplied).not.toHaveClass("MuiChip-colorChipColor");
  });

  it("renders the warning when there are unapplied filters", () => {
    const warningMessage = screen.getByText(
      'Some filter changes have not been applied. Please click on "Apply filters" to update your results.',
    );

    expect(warningMessage).toBeInTheDocument();

    appliedFilters.push({
      id: 2,
      column: "column2",
      operator: "neq",
      value: "value2",
    });

    cleanup();

    render(
      <ThemeProvider>
        <MUIProviders>
          <FilterToolbar
            columns={columns}
            filters={filters}
            setFilters={setFilters}
            handleApplyFilters={handleApplyFilters}
            appliedFilters={appliedFilters}
          />
        </MUIProviders>
      </ThemeProvider>,
    );

    expect(warningMessage).not.toBeInTheDocument();
    appliedFilters.pop();
  });

  it("opens the filter form when 'Add filter' button is clicked", () => {
    const addFilterButton = screen.getByText("Add filter");

    fireEvent.click(addFilterButton);

    const filterForm = screen.getByRole("presentation");

    expect(filterForm).toBeInTheDocument();
  });

  it("applies filters when 'Apply filters' button is clicked", () => {
    const applyFiltersButton = screen.getByText("Apply filters");

    fireEvent.click(applyFiltersButton);

    expect(handleApplyFilters).toHaveBeenCalled();
  });

  it("clears all filters when 'Clear all filters' button is clicked", () => {
    const clearAllFiltersButton = screen.getByText("Clear all filters");

    fireEvent.click(clearAllFiltersButton);

    expect(setFilters).toHaveBeenCalledWith([]);
  });

  it("removes a filter when the corresponding 'Delete' button is clicked", () => {
    const deleteFilterButton = screen.getAllByTestId("CancelIcon")[0];

    fireEvent.click(deleteFilterButton);

    expect(setFilters).toHaveBeenCalledWith([filters[1]]);
  });
});

function MUIProviders({ children }: { children: React.ReactNode }) {
  const theme = useMUITheme();
  return <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>;
}
