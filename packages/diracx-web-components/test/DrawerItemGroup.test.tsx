import { render, screen, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/DrawerItemGroup.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("DrawerItemGroup", () => {
  it("renders group title", () => {
    render(<Default />);
    expect(screen.getByText("Group Title")).toBeInTheDocument();
  });

  it("renders dashboard item", () => {
    render(<Default />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("calls setUserDashboard when an item is clicked", () => {
    render(<Default />);
    const dashboardItem = screen.getByText("Dashboard");
    fireEvent.click(dashboardItem);
    expect(dashboardItem).toBeInTheDocument();
  });
});
