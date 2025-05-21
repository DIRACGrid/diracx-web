import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/BaseApp.stories";

// Compose all the stories
const { Default } = composeStories(stories);

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("BaseApp", () => {
  it("renders the LoggedIn story", () => {
    render(<Default />);
    expect(screen.getByText("Hello John Doe")).toBeInTheDocument();
  });
});
