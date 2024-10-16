import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { Paper } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Dashboard } from "@mui/icons-material";
import { useMUITheme } from "../../hooks/theme";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { DashboardGroup } from "../../types/DashboardGroup";
import DrawerItemGroup from "./DrawerItemGroup";

const meta = {
  title: "Dashboard Layout/DrawerItemGroup",
  component: DrawerItemGroup,
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
} satisfies Meta<typeof DrawerItemGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    group: {
      title: "Group Title",
      extended: true,
      items: [
        {
          title: "Dashboard",
          id: "Dashboard 1",
          type: "Dashboard",
          icon: Dashboard,
        },
      ],
    },
    handleContextMenu: () => () => {},
    setUserDashboard: () => {},
  },
  render: (props) => {
    const [, updateArgs] = useArgs();
    const updateGroups = (groups: React.SetStateAction<DashboardGroup[]>) => {
      if (typeof groups === "function") {
        groups = groups([props.group]);
      }
      updateArgs({ group: groups[0] });
    };
    props.setUserDashboard = updateGroups;
    return <DrawerItemGroup {...props} />;
  },
};
