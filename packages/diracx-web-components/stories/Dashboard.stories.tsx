import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { NavigationProvider } from "../src/contexts/NavigationProvider";
import { applicationList } from "../src/components/applicationList";
import { DashboardGroup } from "../src/types/DashboardGroup";
import Dashboard from "../src/components/DashboardLayout/Dashboard";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

const meta = {
  title: "Dashboard Layout/Dashboard",
  component: Dashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: false },
    drawerWidth: { control: { type: "range", min: 200, max: 500, step: 10 } },
  },
  decorators: [
    (Story) => {
      const [userDashboard, setUserDashboard] = useState<DashboardGroup[]>([
        {
          title: "Group Title",
          extended: true,
          items: [
            {
              id: "example",
              title: "App Name",
              type: "test",
            },
          ],
        },
      ]);
      const [currentAppId, setCurrentAppId] = useState<string>("example");
      return (
        <NavigationProvider
          getPath={() => "/"}
          setPath={() => {}}
          getSearchParams={() => {
            const url = new URLSearchParams();
            url.append("appId", "example");
            return url;
          }}
        >
          <ApplicationsContext.Provider
            value={[
              userDashboard,
              setUserDashboard,
              applicationList,
              currentAppId,
              setCurrentAppId,
            ]}
          >
            <ThemeProvider>
              <Box sx={{ height: "50vh" }}>
                <Story />
              </Box>
            </ThemeProvider>
          </ApplicationsContext.Provider>
        </NavigationProvider>
      );
    },
  ],
  async beforeEach() {},
} satisfies Meta<typeof Dashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div></div>,
    logoURL: process.env.STORYBOOK_DEV
      ? undefined
      : // we need to add "/diracx-web" at the start of the url in production
        // because of the repo name in the github pages url
        "/diracx-web/DIRAC-logo.png",
  },
  render: (props) => {
    return <Dashboard {...props} />;
  },
};
