import { StoryObj, Meta } from "@storybook/react";
import { Paper } from "@mui/material";
import { ApplicationsContext } from "../src/contexts/ApplicationsProvider";
import { NavigationProvider } from "../src/contexts/NavigationProvider";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import JobMonitor from "../src/components/JobMonitor/JobMonitor";
import { setJobsMock, setJobHistoryMock } from "./mocks/JobDataService.mock";

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
                    icon: null,
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

export const Loading: Story = {
  args: {},
  decorators: [
    (Story) => {
      setJobsMock({
        jobs: null,
        error: null,
        isLoading: true,
      });

      setJobHistoryMock({
        jobHistory: jobHistory,
        error: null,
        isLoading: false,
      });

      return <Story />;
    },
  ],
};

export const Error: Story = {
  args: {},
  decorators: [
    (Story) => {
      setJobsMock({
        jobs: null,
        error: {
          message: "Error loading jobs",
          name: "Error",
        },
        isLoading: false,
      });

      setJobHistoryMock({
        jobHistory: jobHistory,
        error: null,
        isLoading: false,
      });

      return <Story />;
    },
  ],
};

export const Empty: Story = {
  args: {},
  decorators: [
    (Story) => {
      setJobsMock({
        jobs: [],
        error: null,
        isLoading: false,
      });

      setJobHistoryMock({
        jobHistory: [],
        error: null,
        isLoading: false,
      });

      return <Story />;
    },
  ],
};

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => {
      setJobsMock({
        jobs: jobs,
        error: null,
        isLoading: false,
      });

      setJobHistoryMock({
        jobHistory: jobHistory,
        error: null,
        isLoading: false,
      });

      return <Story />;
    },
  ],
};
