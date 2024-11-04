import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Paper } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { ProfileButton } from "../src/components/DashboardLayout/ProfileButton";
import { useOidc, useOidcAccessToken } from "./mocks/react-oidc.mock";

const meta = {
  title: "Dashboard Layout/ProfileButton",
  component: ProfileButton,
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
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
      accessTokenPayload: {
        preferred_username: "John Doe",
        vo: "dirac",
        dirac_group: "dirac_user",
        dirac_properties: ["NormalUser", "AnotherProperty"],
      },
    });
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: true,
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof ProfileButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
