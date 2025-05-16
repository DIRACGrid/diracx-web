import { render, screen, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/ErrorBox.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

describe("ErrorBox", () => {
  it("renders default error message", () => {
    render(<Default />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders custom error message", () => {
    render(<Default msg="Custom error occurred" />);
    expect(screen.getByText("Custom error occurred")).toBeInTheDocument();
  });

  it("renders reset button if reset prop is provided and calls it on click", () => {
    const resetMock = jest.fn();
    render(<Default reset={resetMock} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(resetMock).toHaveBeenCalled();
  });

  it("does not render reset button if reset prop is not provided", () => {
    render(<Default />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
