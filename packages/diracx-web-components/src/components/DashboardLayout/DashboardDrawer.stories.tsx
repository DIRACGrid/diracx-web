import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMUITheme } from "../../hooks/theme";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { ApplicationsContext } from "../../contexts";
import { applicationList } from "../ApplicationList";
import DashboardDrawer from "./DashboardDrawer";

const meta = {
  title: "Dashboard Layout/DashboardDrawer",
  component: DashboardDrawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      const [sections, setSections] = React.useState([
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
          value={[sections, setSections, applicationList]}
        >
          <MUIThemeProvider theme={theme}>
            <Box sx={{ width: "240px", height: "50vh" }}>
              <Story />
            </Box>
          </MUIThemeProvider>
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
  },
};
