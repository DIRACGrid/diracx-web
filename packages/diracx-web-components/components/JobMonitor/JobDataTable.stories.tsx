import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMUITheme } from "../../hooks/theme";
import { useJobs } from "../../mocks/JobDataService.mock";
import { useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { JobDataTable } from "./JobDataTable";

const meta = {
  title: "Job Monitor/JobDataTable",
  component: JobDataTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  async beforeEach() {
    useOidcAccessToken.mockReturnValue({
      accessToken: "123456789",
    });

    return () => {
      useOidcAccessToken.mockRestore();
    };
  },
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Story />
        </MUIThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof JobDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render() {
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
    return JobDataTable();
  },
};

export const Empty: Story = {
  args: {},
  render() {
    useJobs.mockReturnValue({
      data: {
        data: [],
      },
    });
    return JobDataTable();
  },
};
