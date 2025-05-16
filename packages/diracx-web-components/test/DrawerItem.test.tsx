import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/DrawerItem.stories";

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

describe("DrawerItem", () => {
  it("renders with the default props", () => {
    render(<Default />);

    // Checks for item title
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
