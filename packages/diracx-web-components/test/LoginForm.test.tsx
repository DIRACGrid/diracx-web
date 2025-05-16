import { render, screen, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import {
  singleVOMetadata,
  multiVOMetadata,
} from "../stories/mocks/metadata.fixtures.mock";
import * as stories from "../stories/LoginForm.stories";
import { useOidc } from "../stories/mocks/react-oidc.mock";

const { SingleVO, MultiVO } = composeStories(stories);

jest.mock("../src/hooks/metadata", () => ({
  useMetadata: jest.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    metadata: require("../stories/LoginForm.stories").singleVOMetadata,
    error: null,
    isLoading: false,
  })),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    // reset the metadata mock back to singleVOMetadata
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("../src/hooks/metadata").useMetadata as jest.Mock).mockReturnValue(
      {
        metadata: singleVOMetadata,
        error: null,
        isLoading: false,
      },
    );

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
    // for this test only, override to multiVOMetadata
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("../src/hooks/metadata").useMetadata as jest.Mock).mockReturnValue(
      {
        metadata: multiVOMetadata,
        error: null,
        isLoading: false,
      },
    );

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
});
