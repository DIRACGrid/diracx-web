import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ThemeProvider } from "@mui/material";
import { useArgs } from "@storybook/core/preview-api";

import { ApplicationsContext } from "../../contexts";
import { useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { applicationList } from "../ApplicationList";
import { useMUITheme } from "../../hooks/theme";
import ApplicationDialog from "./ApplicationDialog";

const meta = {
  title: "Dashboard Layout/ApplicationDialog",
  component: ApplicationDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    appDialogOpen: { control: "boolean" },
    setAppDialogOpen: { control: false },
    handleCreateApp: { control: false },
  },
  decorators: [
    (Story) => {
      return (
        <ApplicationsContext.Provider value={[[], () => {}, applicationList]}>
          <Story />
        </ApplicationsContext.Provider>
      );
    },
    (Story) => {
      const theme = useMUITheme();
      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
      accessTokenPayload: { preferred_username: "John Doe" },
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof ApplicationDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    appDialogOpen: true,
    setAppDialogOpen: () => {},
    handleCreateApp: () => {},
  },
  render: (props) => {
    const [, updateArgs] = useArgs();
    props.setAppDialogOpen = (open) => updateArgs({ appDialogOpen: open });
    return <ApplicationDialog {...props} />;
  },
};
