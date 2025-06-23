import { StoryObj, Meta } from "@storybook/react";
import { Paper } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { LoginForm } from "../src/components/Login/LoginForm";
import { setMetadataMock } from "./mocks/metadata.mock";

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

const meta = {
  title: "Login/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    logoURL: { control: { disable: true } },
  },
  decorators: [
    (Story) => {
      return (
        <ThemeProvider>
          <Paper sx={{ p: 2 }}>
            <Story />
          </Paper>
        </ThemeProvider>
      );
    },
  ],
  args: {
    logoURL: process.env.STORYBOOK_DEV
      ? undefined
      : "/diracx-web/DIRAC-logo-minimal.png", // we need to add "/diracx-web" at the start of the url in production because of the repo name in the github pages url
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  decorators: [
    (Story) => {
      // Set the mock data before rendering
      setMetadataMock({
        metadata: null,
        error: null,
        isLoading: true,
      });
      return <Story />;
    },
  ],
};

export const Error: Story = {
  decorators: [
    (Story) => {
      // Set the mock data before rendering
      setMetadataMock({
        metadata: null,
        error: {
          message: "Error loading metadata",
          name: "Error",
        },
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

export const SingleVO: Story = {
  decorators: [
    (Story) => {
      // Set the mock data before rendering
      setMetadataMock({
        metadata: singleVOMetadata,
        error: null,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};

export const MultiVO: Story = {
  decorators: [
    (Story) => {
      // Set the mock data before rendering
      setMetadataMock({
        metadata: multiVOMetadata,
        error: null,
        isLoading: false,
      });
      return <Story />;
    },
  ],
};
