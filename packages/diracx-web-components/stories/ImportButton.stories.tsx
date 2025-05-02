import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { ImportButton } from "../src/components/DashboardLayout/ImportButton";

const meta = {
  title: "Dashboard Layout/ImportButton",
  component: ImportButton,
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
} satisfies Meta<typeof ImportButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
