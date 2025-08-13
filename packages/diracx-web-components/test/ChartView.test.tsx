import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/ChartView.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

describe("ChartView", () => {
  it("renders the element", () => {
    render(<Default />);
    expect(screen.getByText("Select Columns")).toBeInTheDocument();
    expect(screen.getByText("Level 1")).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<Default title="Custom title" />);
    expect(screen.getByText("Custom title")).toBeInTheDocument();
  });

  it("renders with columns", () => {
    render(<Default groupColumns={["Column 1", "Column 2"]} />);

    expect(screen.getByDisplayValue("Column 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Column 2")).toBeInTheDocument();
  });
});
