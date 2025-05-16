import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import DrawerItem from "../src/components/DashboardLayout/DrawerItem";

const meta = {
  title: "Dashboard Layout/DrawerItem",
  component: DrawerItem,
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
  async beforeEach() {},
} satisfies Meta<typeof DrawerItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groupTitle: "Default Applications",
    index: 0,
    item: {
      title: "Dashboard",
      type: "dashboard",
      id: "Dashboard 1",
      icon: Dashboard,
    },
    renamingItemId: null,
    setRenamingItemId: () => {},
    renameValue: "",
    setRenameValue: () => {},
    setUserDashboard: () => {},
  },
};
