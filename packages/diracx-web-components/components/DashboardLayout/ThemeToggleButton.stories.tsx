import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMUITheme } from "../../hooks/theme";
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
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Paper sx={{ width: "fit-content" }}>
            <Story />
          </Paper>
        </MUIThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
