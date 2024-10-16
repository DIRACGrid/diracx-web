import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { useMUITheme } from "../../hooks/theme";
import { ApplicationsContext } from "../../contexts/ApplicationsProvider";
import { NavigationProvider } from "../../contexts/NavigationProvider";
import BaseApp from "./BaseApp";

const meta = {
  title: "Base Application",
  component: BaseApp,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    headerSize: { control: "radio" },
  },
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Paper sx={{ p: 2 }}>
            <Story />
          </Paper>
        </MUIThemeProvider>
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
                    icon: Apps,
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
  async beforeEach() {
    return () => {
      useOidcAccessToken.mockRestore();
    };
  },
} satisfies Meta<typeof BaseApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    headerSize: undefined,
  },
  render: (props) => {
    useOidcAccessToken.mockReturnValue({
      accessTokenPayload: { preferred_username: "John Doe" },
    });
    return <BaseApp {...props} />;
  },
};

export const LoggedOff: Story = {
  args: {
    headerSize: undefined,
  },
  render: (props) => {
    useOidcAccessToken.mockReturnValue({
      accessTokenPayload: null,
    });
    return <BaseApp {...props} />;
  },
};
