import { render, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/DashboardDrawer.stories";

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

const { Default } = composeStories(stories);

describe("DashboardDrawer", () => {
  it("renders the app title from the context", () => {
    const { getByText } = render(<Default />);
    expect(getByText("App Name")).toBeInTheDocument();
  });

  it("shows the context menu when right-clicking on an app item", () => {
    const { getByText, getByTestId } = render(<Default />);
    fireEvent.contextMenu(getByText("App Name"));
    expect(getByTestId("context-menu")).toBeInTheDocument();
  });
});
