import { StoryObj, Meta } from "@storybook/react";
import { Paper } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { NavigationProvider } from "../src/contexts/NavigationProvider";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import BaseApp from "../src/components/BaseApp/BaseApp";

const meta = {
  title: "Base Application",
  component: BaseApp,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
  async beforeEach() {},
} satisfies Meta<typeof BaseApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: (props) => {
    return <BaseApp {...props} />;
  },
};
