import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Dashboard } from "@mui/icons-material";
import { useMUITheme } from "../../hooks/theme";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import DrawerItem from "./DrawerItem";

const meta = {
  title: "Dashboard Layout/DrawerItem",
  component: DrawerItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Paper sx={{ width: "240px" }}>
            <Story />
          </Paper>
        </MUIThemeProvider>
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
} satisfies Meta<typeof DrawerItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groupTitle: "Default Applications",
    index: 0,
    item: {
      title: "Dashboard",
      id: "Dashboard 1",
      icon: Dashboard,
    },
  },
};
