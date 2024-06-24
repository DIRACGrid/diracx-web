import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { NavigationProvider, ApplicationsContext } from "../../contexts";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { applicationList } from "../ApplicationList";
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
      const [sections, setSections] = React.useState([
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
            value={[sections, setSections, applicationList]}
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
  args: { children: <div></div> },
  render: (props) => {
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: true,
    });
    return <Dashboard {...props} />;
  },
};
