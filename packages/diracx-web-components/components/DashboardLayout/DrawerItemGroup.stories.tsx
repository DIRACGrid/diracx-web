import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { Paper } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Dashboard } from "@mui/icons-material";
import { useMUITheme } from "../../hooks/theme";
import { useOidc, useOidcAccessToken } from "../../mocks/react-oidc.mock";
import DrawerItemGroup from "./DrawerItemGroup";

const meta = {
  title: "Dashboard Layout/DrawerItemGroup",
  component: DrawerItemGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Paper sx={{ width: "240px" }}>
            <Story />
          </Paper>
        </MUIThemeProvider>
      );
    },
  ],
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
      accessTokenPayload: { preferred_username: "John Doe" },
    });
    useOidc.mockReturnValue({
      login: () => {},
      isAuthenticated: true,
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof DrawerItemGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    group: {
      title: "Group Title",
      extended: true,
      items: [
        {
          title: "Dashboard",
          id: "Dashboard 1",
          type: "Dashboard",
          icon: Dashboard,
        },
      ],
    },
    handleContextMenu: () => () => {},
    setSections: () => {},
  },
  render: (props) => {
    const [, updateArgs] = useArgs();
    const updateSections = (sections) => {
      if (typeof sections === "function") {
        sections = sections([props.group]);
      }
      updateArgs({ group: sections[0] });
    };
    props.setSections = updateSections;
    return <DrawerItemGroup {...props} />;
  },
};
