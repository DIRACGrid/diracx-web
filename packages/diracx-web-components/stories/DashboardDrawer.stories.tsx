import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { applicationList } from "../src/components/ApplicationList";
import { DashboardGroup } from "../src/types";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import DashboardDrawer from "../src/components/DashboardLayout/DashboardDrawer";
import { useOidc, useOidcAccessToken } from "./mocks/react-oidc.mock";

const meta = {
  title: "Dashboard Layout/DashboardDrawer",
  component: DashboardDrawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
              icon: Dashboard,
              type: "test",
            },
          ],
        },
      ]);
      return (
        <ApplicationsContext.Provider
          value={[userDashboard, setUserDashboard, applicationList]}
        >
          <ThemeProvider>
            <Box sx={{ width: "240px", height: "50vh" }}>
              <Story />
            </Box>
          </ThemeProvider>
        </ApplicationsContext.Provider>
      );
    },
  ],
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
      accessTokenPayload: { preferred_username: "John Doe" },
    });
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: true,
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof DashboardDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "permanent",
    mobileOpen: false,
    handleDrawerToggle: () => {},
    width: 240,
    logoURL: process.env.STORYBOOK_DEV
      ? undefined
      : "/diracx-web/DIRAC-logo.png", // we need to add "/diracx-web" at the start of the url in production because of the repo name in the github pages url
  },
};
