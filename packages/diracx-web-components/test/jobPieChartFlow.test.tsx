import { render, screen, fireEvent, within } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/JobMonitor.stories";

const { Default } = composeStories(stories);

describe("Pie chart interaction flow", () => {
  it("clicking a legend label adds filter chips to the search bar", async () => {
    render(<Default />);

    const legendItem = await screen.findByLabelText(
      "Filter by Running",
      {},
      { timeout: 10000 },
    );
    fireEvent.click(legendItem);

    // The filter surfaces as chips in the search bar: Status = Running
    const searchBar = screen.getByTestId("search-bar");
    await screen.findByText("Running", {
      selector: '[data-testid="search-bar"] .MuiChip-root *',
    });
    expect(searchBar.querySelectorAll(".MuiChip-root").length).toBe(3);
    expect(searchBar.textContent).toContain("Status");
  }, 30000);

  it("switching grouping relabels the legend and targets filters at the new column", async () => {
    render(<Default />);
    await screen.findByLabelText("Filter by Running", {}, { timeout: 10000 });

    const selector = screen.getByTestId("group-selector");
    fireEvent.click(within(selector).getByRole("button", { name: "Site" }));

    // Legend relabels from the Site column — never "undefined"
    // (regression: stale keepPreviousData rows labeled with the new column)
    await screen.findByLabelText("Filter by SiteA", {}, { timeout: 10000 });
    expect(screen.queryByText("undefined")).toBeNull();

    // Clicking the new legend files a filter on the Site column
    fireEvent.click(screen.getByLabelText("Filter by SiteA"));
    await screen.findByText("SiteA", {
      selector: '[data-testid="search-bar"] .MuiChip-root *',
    });
    expect(screen.getByTestId("search-bar").textContent).toContain("Site");
  }, 30000);
});
