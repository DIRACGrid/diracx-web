import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { Paper, ThemeProvider } from "@mui/material";
import { useMUITheme } from "../../hooks/theme";
import { ApplicationsContext, NavigationProvider } from "../../contexts";
import ApplicationHeader from "./ApplicationHeader";

const meta = {
  title: "shared/ApplicationHeader",
  component: ApplicationHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    size: { options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  },
} satisfies Meta<typeof ApplicationHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "App Type",
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
    (Story) => (
      <NavigationProvider
        getPath={() => "/"}
        setPath={() => {}}
        getSearchParams={() => {
          const url = new URLSearchParams();
          url.append("appId", "example");
          return url;
        }}
      >
        <ApplicationsContext.Provider
          value={[
            [
              {
                title: "group",
                extended: true,
                items: [
                  {
                    id: "example",
                    title: "App Name",
                    icon: React.Component,
                    type: "test",
                  },
                ],
              },
            ],
            () => {},
            [],
          ]}
        >
          <Story />
        </ApplicationsContext.Provider>
      </NavigationProvider>
    ),
  ],
};
