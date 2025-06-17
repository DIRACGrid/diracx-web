import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/DataTable.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

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

  it("renders Edit menu item if menu is opened", () => {
    render(<Default />);
    const moreButtons = screen.queryAllByRole("button");
    const menuButton = moreButtons.find((btn) =>
      /menu|action|more/i.test(
        btn.textContent || btn.getAttribute("aria-label") || "",
      ),
    );
    if (menuButton) {
      fireEvent.click(menuButton);
      expect(screen.getByText("Edit")).toBeInTheDocument();
    }
  });
});
