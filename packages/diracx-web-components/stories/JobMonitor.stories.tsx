import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { Paper } from "@mui/material";
import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { NavigationProvider } from "../src/contexts/NavigationProvider";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import JobMonitor from "../src/components/JobMonitor/JobMonitor";
import { useOidcAccessToken } from "./mocks/react-oidc.mock";
import { useJobs } from "./mocks/JobDataService.mock";

const meta = {
  title: "Job Monitor/JobMonitor",
  component: JobMonitor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider>
          <Paper sx={{ p: 2 }} elevation={5}>
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
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
    });
    return () => useOidcAccessToken.mockReset();
  },
} satisfies Meta<typeof JobMonitor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render(args) {
    useJobs.mockReturnValue({
      data: {
        data: [
          {
            JobID: 1,
            JobName: "Job 1",
            Site: "ANY",
            Status: "Received",
            MinorStatus: "Job accepted",
            SubmissionTime: "2024-01-01T12:00:30",
          },
          {
            JobID: 2,
            JobName: "Job 2",
            Site: "ANY",
            Status: "Received",
            MinorStatus: "Job accepted",
            SubmissionTime: "2024-01-01T12:00:00",
          },
        ],
      },
    });
    return <JobMonitor {...args} />;
  },
};
