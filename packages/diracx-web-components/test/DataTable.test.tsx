import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/DataTable.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

afterEach(() => {
  // Clean up the DOM after each test to avoid strange behavior
  cleanup();
});

describe("DataTable", () => {
  it("renders table title", () => {
    render(<Default />);
    expect(screen.getByText("Data Table")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<Default />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders Edit menu item when the row context menu is opened", () => {
    render(<Default />);
    // The row actions menu opens on right-click (context menu) on a row.
    // getByText throws if the row is missing, so the assertion below can
    // never pass vacuously.
    const rowCell = screen.getByText("John Doe");
    fireEvent.contextMenu(rowCell);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("hide footer when hideFooter prop is true", () => {
    const { queryByTestId } = render(<Default hideFooter={true} />);
    expect(queryByTestId("data-table-pagination")).not.toBeInTheDocument();
  });
});
