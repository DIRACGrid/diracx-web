import { StoryObj, Meta } from "@storybook/nextjs";
import { Box } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import JobMonitor from "../src/components/JobMonitor/JobMonitor";
import { JobMockProvider } from "./mocks/contexts.mock";

const meta = {
  title: "Job Monitor/JobMonitor",
  component: JobMonitor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box sx={{ height: "50vh" }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  async beforeEach() {},
} satisfies Meta<typeof JobMonitor>;

export default meta;
type Story = StoryObj<typeof meta>;

const jobs = [
  {
    JobID: 1,
    JobName: "Job 1",
    Site: "ANY",
    Status: "Running",
    MinorStatus: "Job running",
    SubmissionTime: new Date("2024-01-01T12:00:30"),
    JobGroup: "Group A",
    JobType: "Type A",
    Owner: "Owner A",
    OwnerGroup: "OwnerGroup A",
    VO: "VO A",
    ApplicationStatus: "Initializing",
    RescheduleTime: new Date("2024-01-01T13:00:00"),
    LastUpdateTime: new Date("2024-01-01T12:30:00"),
    StartExecTime: new Date("2024-01-01T12:05:00"),
    HeartBeatTime: new Date("2024-01-01T12:10:00"),
    EndExecTime: null,
    UserPriority: 1,
    RescheduleCounter: 0,
    VerifiedFlag: true,
    AccountedFlag: "Yes",
  },
  {
    JobID: 2,
    JobName: "Job 2",
    Site: "ANY",
    Status: "Received",
    MinorStatus: "Job accepted",
    SubmissionTime: new Date("2024-01-01T12:00:00"),
    JobGroup: "Group B",
    JobType: "Type B",
    Owner: "Owner B",
    OwnerGroup: "OwnerGroup B",
    VO: "VO B",
    ApplicationStatus: "Pending",
    RescheduleTime: new Date("2024-01-01T13:30:00"),
    LastUpdateTime: new Date("2024-01-01T12:45:00"),
    StartExecTime: null,
    HeartBeatTime: null,
    EndExecTime: null,
    UserPriority: 2,
    RescheduleCounter: 1,
    VerifiedFlag: false,
    AccountedFlag: "No",
  },
];

const jobHistory = [
  {
    Status: "Submitted",
    MinorStatus: "",
    ApplicationStatus: "",
    StatusTime: "2024-07-04T13:00:00",
    Source: "Storybook",
  },
  {
    Status: "Received",
    MinorStatus: "Job accepted",
    ApplicationStatus: "",
    StatusTime: "2024-07-04T13:00:03",
    Source: "Storybook",
  },
  {
    Status: "Running",
    MinorStatus: "Job initializing",
    ApplicationStatus: "Unknown",
    StatusTime: "2024-07-04T13:00:10",
    Source: "Storybook",
  },
  {
    Status: "Running",
    MinorStatus: "Job running",
    ApplicationStatus: "Unknown",
    StatusTime: "2024-07-04T13:00:10",
    Source: "Storybook",
  },
];
export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      return (
        <JobMockProvider
          jobs={jobs}
          jobHistory={jobHistory}
          error={null}
          isLoading={false}
        >
          <Story key="default" />
        </JobMockProvider>
      );
    },
  ],
};

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      return (
        <JobMockProvider
          jobs={null}
          jobHistory={null}
          error={null}
          isLoading={true}
        >
          <Story />
        </JobMockProvider>
      );
    },
  ],
};

export const WithError: Story = {
  args: {},
  decorators: [
    (Story) => {
      return (
        <JobMockProvider
          jobs={null}
          jobHistory={null}
          error={new Error("Custom error message here")}
          isLoading={false}
        >
          <Story />
        </JobMockProvider>
      );
    },
  ],
};

export const Empty: Story = {
  args: {},
  decorators: [
    (Story) => {
      return (
        <JobMockProvider
          jobs={[]}
          jobHistory={[]}
          error={null}
          isLoading={false}
        >
          <Story />
        </JobMockProvider>
      );
    },
  ],
};
