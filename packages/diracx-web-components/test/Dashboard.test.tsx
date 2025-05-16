import { render, fireEvent } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import { useMediaQuery } from "@mui/material";
import * as stories from "../stories/Dashboard.stories";

// Compose your Storybook stories (this will include all decorators/args)
const { Default } = composeStories(stories);

jest.mock("@axa-fr/react-oidc", () => ({
  useOidc: jest.fn(),
  useOidcAccessToken: jest.fn(),
}));

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    // Typical authenticated state (adapt to your needs)
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessTokenPayload: { test: "test" },
    });
    (useOidc as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders in desktop mode", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // desktop

    const { getByTestId } = render(<Default />);

    // On desktop, the permanent drawer should be visible
    expect(getByTestId("drawer-permanent")).toBeVisible();

    // The temporary drawer (for mobile) should not be rendered
    expect(() => getByTestId("drawer-temporary")).toThrow();
  });

  it("renders in mobile mode and opens drawer after toggle", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // mobile

    const { getByTestId } = render(<Default />);
    const toggleButton = getByTestId("drawer-toggle-button");

    // Initially, the temporary drawer is not visible
    expect(() => getByTestId("drawer-temporary")).toThrow();

    // Simulate user opening the drawer
    fireEvent.click(toggleButton);

    // Now, the temporary drawer should be visible
    expect(getByTestId("drawer-temporary")).toBeVisible();
  });
});
