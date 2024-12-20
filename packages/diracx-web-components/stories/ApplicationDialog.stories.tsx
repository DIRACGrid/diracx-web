import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { useArgs } from "@storybook/core/preview-api";

import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { applicationList } from "../src/components/ApplicationList";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import ApplicationDialog from "../src/components/DashboardLayout/ApplicationDialog";
import { useOidcAccessToken } from "./mocks/react-oidc.mock";

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
      return (
        <ThemeProvider>
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
