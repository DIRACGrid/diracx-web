import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import { ThemeToggleButton } from "./ThemeToggleButton";

const meta = {
  title: "Dashboard Layout/ThemeToggleButton",
  component: ThemeToggleButton,
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
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
