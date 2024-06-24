import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { Paper, ThemeProvider } from "@mui/material";
import { useMetadata } from "../../mocks/metadata.mock";
import { useOidc } from "../../mocks/react-oidc.mock";
import { useMUITheme } from "../../hooks/theme";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Login/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    logoURL: { control: "text" },
  },
  beforeEach: async () => {
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: false,
    });
  },
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <ThemeProvider theme={theme}>
          <Paper sx={{ p: 2 }}>
            <Story />
          </Paper>
        </ThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const singleVOMetadata = {
  virtual_organizations: {
    DTeam: {
      groups: {
        admin: {
          properties: ["AdminUser"],
        },
        user: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message: "Please contact system administrator",
        webpage: null,
        email: null,
      },
      default_group: "user",
    },
  },
};

const multiVOMetadata = {
  virtual_organizations: {
    LHCp: {
      groups: {
        user: {
          properties: ["NormalUser"],
        },
        admin: {
          properties: ["AdminUser"],
        },
      },
      support: {
        message: "Please contact the system administrator",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
    PridGG: {
      groups: {
        admin: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message:
          "Please restart your machine, if it still does not work, please try again later",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
  },
};

export const SingleVO: Story = {
  render() {
    useMetadata.mockReturnValue({
      metadata: singleVOMetadata,
      error: null,
      isLoading: false,
    });
    return <LoginForm />;
  },
};

export const MultiVO: Story = {
  args: {
    logoURL:
      "https://raw.githubusercontent.com/DIRACGrid/management/master/branding/diracx/svg/diracx-logo-square-minimal.svg",
  },
  render() {
    useMetadata.mockReturnValue({
      metadata: multiVOMetadata,
      error: null,
      isLoading: false,
    });
    return <LoginForm />;
  },
};
