import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { Paper } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { DashboardGroup } from "../src/types/DashboardGroup";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import DrawerItemGroup from "../src/components/DashboardLayout/DrawerItemGroup";
import { useOidc, useOidcAccessToken } from "./mocks/react-oidc.mock";

const meta = {
  title: "Dashboard Layout/DrawerItemGroup",
  component: DrawerItemGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider>
          <Paper sx={{ width: "240px" }}>
            <Story />
          </Paper>
        </ThemeProvider>
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
