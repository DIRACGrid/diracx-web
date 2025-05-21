import { render, screen, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/LoginForm.stories";
import { useOidc } from "../stories/mocks/react-oidc.mock";

const { SingleVO, MultiVO, Error, Loading } = composeStories(stories);

describe("LoginForm", () => {
  beforeEach(() => {
    // ensure OIDC is always logged out by default
    useOidc.mockReturnValue({ login: () => {}, isAuthenticated: false });
  });

  it("works for the SingleVO story", () => {
    render(<SingleVO />);

    // now immediately rendered
    expect(screen.getByTestId("h3-vo-name")).toBeInTheDocument();
    expect(screen.queryByTestId("autocomplete-vo-select")).toBeNull();
    expect(screen.getByTestId("select-group")).toBeInTheDocument();
    expect(screen.getByTestId("button-login")).toBeInTheDocument();
  });

  it("works for the MultiVO story", () => {
    render(<MultiVO />);

    const input = screen
      .getByTestId("autocomplete-vo-select")
      .querySelector("input") as HTMLInputElement;

    // before selection
    expect(screen.queryByTestId("button-login")).toBeNull();

    // pick “LHCp”
    fireEvent.change(input, { target: { value: "LHC" } });
    fireEvent.click(screen.getByText("LHCp"));

    expect(screen.getByTestId("select-group")).toBeInTheDocument();
    expect(screen.getByTestId("button-login")).toBeInTheDocument();
  });

  it("works for the Error story", () => {
    render(<Error />);

    expect(
      screen.getByText("An error occurred while fetching metadata."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("h3-vo-name")).toBeNull();
  });

  it("works for the Loading story", () => {
    render(<Loading />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("h3-vo-name")).toBeNull();
  });
});
