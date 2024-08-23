import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { useMUITheme } from "../../hooks/theme";
import { ApplicationsContext } from "../../contexts/ApplicationsProvider";
import { NavigationProvider } from "../../contexts/NavigationProvider";
import UserDashboard from "./UserDashboard";

const meta = {
  title: "User Dashboard/UserDashboard",
  component: UserDashboard,
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
  async beforeEach() {
    return () => {
      useOidcAccessToken.mockRestore();
    };
  },
} satisfies Meta<typeof UserDashboard>;

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
    return <UserDashboard {...props} />;
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
    return <UserDashboard {...props} />;
  },
};
