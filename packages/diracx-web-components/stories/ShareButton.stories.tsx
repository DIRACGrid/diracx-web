import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { ShareButton } from "../src/components/DashboardLayout/ShareButton";

const meta = {
  title: "Dashboard Layout/ShareButton",
  component: ShareButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider>
          <Paper sx={{ width: "fit-content" }}>
            <Story />
          </Paper>
        </ThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof ShareButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
