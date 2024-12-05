import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { ApplicationsContext } from "../../contexts/ApplicationsProvider";
import { NavigationProvider } from "../../contexts/NavigationProvider";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { applicationList } from "../ApplicationList";
import { DashboardGroup } from "../../types/DashboardGroup";
import Dashboard from "./Dashboard";

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
              icon: DashboardIcon,
              type: "test",
            },
          ],
        },
      ]);
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
            value={[userDashboard, setUserDashboard, applicationList]}
          >
            <Box sx={{ height: "50vh" }}>
              <Story />
            </Box>
          </ApplicationsContext.Provider>
        </NavigationProvider>
      );
    },
  ],
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
      accessTokenPayload: { preferred_username: "John Doe" },
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof Dashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div></div>,
    logoURL: process.env.STORYBOOK_DEV
      ? undefined
      : "/diracx-web/DIRAC-logo.png", // we need to add "/diracx-web" at the start of the url in production because of the repo name in the github pages url
  },
  render: (props) => {
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: true,
    });
    return <Dashboard {...props} />;
  },
};
