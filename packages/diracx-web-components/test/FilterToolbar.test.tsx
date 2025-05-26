import { render, screen, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/FilterToolbar.stories";

const { Default } = composeStories(stories);

describe("FilterToolbar", () => {
  it("shows the three main buttons", () => {
    render(<Default />);
    expect(
      screen.getByRole("button", { name: /add filter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /apply filters/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear all filters/i }),
    ).toBeInTheDocument();
  });

  it("renders filter chips with correct applied / unapplied classes", () => {
    render(<Default />);
    // chip text is rendered inside a div/span, we search the chip root by nearest div
    const appliedChip = screen.getByText("id eq 1").closest("div");
    const unappliedChip = screen.getByText("id neq 2").closest("div"); // story renamed automaticly

    expect(appliedChip).toHaveClass("chip-filter-applied");
    expect(unappliedChip).toHaveClass("chip-filter-unapplied");
  });

  it("warns the user about unapplied filters", () => {
    render(<Default />);
    expect(
      screen.getByText(/Some filter changes have not been applied/i),
    ).toBeInTheDocument();
  });

  it("opens the filter form popper when *Add filter* is clicked", () => {
    render(<Default />);
    fireEvent.click(screen.getByRole("button", { name: /add filter/i }));
    expect(screen.getByRole("presentation")).toBeInTheDocument(); // the MUI Popper
  });
});
