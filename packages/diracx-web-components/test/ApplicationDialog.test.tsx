import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/ApplicationDialog.stories";

// Compose all stories
const { Default } = composeStories(stories);

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("ApplicationDialog", () => {
  it("renders the Default story with the dialog open", () => {
    render(<Default />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Available applications")).toBeInTheDocument();
  });
});
