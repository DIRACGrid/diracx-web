import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { useJobs } from "../../mocks/JobDataService.mock";
import { useOidcAccessToken } from "../../mocks/react-oidc.mock";
import { ThemeProvider } from "../../contexts/ThemeProvider";
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
      return (
        <ThemeProvider>
          <Story />
        </ThemeProvider>
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
