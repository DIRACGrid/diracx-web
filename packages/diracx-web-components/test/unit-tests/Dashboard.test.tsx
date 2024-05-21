import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import Dashboard from "@/components/layout/Dashboard";
import DashboardDrawer from "@/components/ui/DashboardDrawer";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { UserSection } from "@/types/UserSection";

// Mock the module
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
  useOidc: jest.fn(),
}));

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

let mockSections: UserSection[] = [
  {
    title: "Group 1",
    extended: true,
    items: [
      {
        title: "App 1",
        id: "app1",
        type: "Dashboard",
        icon: () => <div>App 1 Icon</div>,
      },
    ],
  },
];

const params = new URLSearchParams();

jest.mock("next/navigation", () => {
  return {
    usePathname: () => ({
      pathname: "",
    }),
    useRouter: () => ({
      push: jest.fn(),
    }),
    useSearchParams: () => params,
  };
});

const MockApplicationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): JSX.Element => (
  <ApplicationsContext.Provider
    value={[
      mockSections,
      jest.fn((test) => {
        mockSections = test();
      }),
    ]}
  >
    {children}
  </ApplicationsContext.Provider>
);

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
    global.innerWidth = 350; // e.g., 350px width for mobile
    global.dispatchEvent(new Event("resize"));

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

describe("<DashboardDrawer>", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <ThemeProvider>
        <MockApplicationProvider>
          <DashboardDrawer variant="permanent" />
        </MockApplicationProvider>
      </ThemeProvider>,
    );

    expect(getByText("App 1 Icon")).toBeInTheDocument();
  });

  it("handles context menu", () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <MockApplicationProvider>
          <DashboardDrawer variant="permanent" />
        </MockApplicationProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(getByText("App 1"));

    expect(getByTestId("context-menu")).toBeInTheDocument();
  });
});
