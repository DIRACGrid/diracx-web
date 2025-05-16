import { StoryObj, Meta } from "@storybook/react";
import { Paper } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { LoginForm } from "../src/components/Login/LoginForm";
import { useMetadata } from "./mocks/metadata.mock";
import {
  singleVOMetadata,
  multiVOMetadata,
} from "./mocks/metadata.fixtures.mock";

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

export const SingleVO: Story = {
  render(props) {
    useMetadata.mockReturnValue({
      metadata: singleVOMetadata,
      error: undefined,
      isLoading: false,
    });
    return <LoginForm {...props} />;
  },
};

export const MultiVO: Story = {
  args: {
    logoURL:
      "https://raw.githubusercontent.com/DIRACGrid/management/master/branding/diracx/svg/diracx-logo-square-minimal.svg",
  },
  render(props) {
    useMetadata.mockReturnValue({
      metadata: multiVOMetadata,
      error: undefined,
      isLoading: false,
    });
    return <LoginForm {...props} />;
  },
};
