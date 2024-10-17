import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import DashboardDrawer from "@/components/DashboardLayout/DashboardDrawer";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { DashboardGroup } from "@/types/DashboardGroup";
import { applicationList } from "@/components/ApplicationList";

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

const mockSections: DashboardGroup[] = [
  {
    title: "Group 1",
    extended: true,
    items: [
      {
        title: "App 1",
        id: "app1",
        type: "Dashboard",
        icon: DashboardIcon,
      },
    ],
  },
];

const MockApplicationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}): JSX.Element => (
  <ApplicationsContext.Provider
    value={[mockSections, () => {}, applicationList]}
  >
    {children}
  </ApplicationsContext.Provider>
);

describe("<DashboardDrawer>", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <ThemeProvider>
        <MockApplicationProvider>
          <DashboardDrawer
            variant="permanent"
            mobileOpen={false}
            width={100}
            handleDrawerToggle={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </MockApplicationProvider>
      </ThemeProvider>,
    );

    expect(getByText("App 1")).toBeInTheDocument();
  });

  it("handles context menu", () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <MockApplicationProvider>
          <DashboardDrawer
            variant="permanent"
            mobileOpen={false}
            width={100}
            handleDrawerToggle={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </MockApplicationProvider>
      </ThemeProvider>,
    );

    fireEvent.contextMenu(getByText("App 1"));

    expect(getByTestId("context-menu")).toBeInTheDocument();
  });
});
