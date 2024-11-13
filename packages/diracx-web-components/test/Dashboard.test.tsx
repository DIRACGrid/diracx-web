import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import { useMediaQuery } from "@mui/material";
import Dashboard from "../src/components/DashboardLayout/Dashboard";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

// Mock the useOidcAccessToken and useOidc hooks
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
  useOidc: jest.fn(),
}));

// Mock the useMediaQuery hook to control the return value
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("<Dashboard>", () => {
  beforeEach(() => {
    // Mock the return value for each test
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessTokenPayload: {
        test: "test",
      },
    });
    (useOidc as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Normal case
  it("renders on desktop screen", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // e.g., desktop screen

    const { getByTestId } = render(
      <ThemeProvider>
        <Dashboard>
          <h1>Test</h1>
        </Dashboard>
      </ThemeProvider>,
    );

    // `drawer-temporary` should not even be in the DOM for desktop screen sizes
    expect(() => getByTestId("drawer-temporary")).toThrow();
    // Expect `drawer-permanent` to now be visible
    expect(getByTestId("drawer-permanent")).toBeVisible();
  });

  // Testing a hypothetical toggle button for the drawer
  it("renders on mobile screen", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // e.g., mobile screen

    const { getByTestId } = render(
      <ThemeProvider>
        <Dashboard>
          <h1>Test</h1>
        </Dashboard>
      </ThemeProvider>,
    );
    const toggleButton = getByTestId("drawer-toggle-button");

    // Assuming the drawer is initially closed
    // `drawer-temporary` should not even be in the DOM initially
    expect(() => getByTestId("drawer-temporary")).toThrow();

    // Simulate a button click
    fireEvent.click(toggleButton);

    // Expect the drawer to now be visible
    expect(getByTestId("drawer-temporary")).toBeVisible();
  });
});
