import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import { JobHistoryDialog } from "./JobHistoryDialog";

const meta = {
  title: "Job Monitor/JobHistoryDialog",
  component: JobHistoryDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    historyData: { control: "object" },
    open: { control: "boolean" },
    onClose: { action: "onClose" },
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
} satisfies Meta<typeof JobHistoryDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    historyData: [
      {
        Status: "Success",
        MinorStatus: "Success",
        ApplicationStatus: "Success",
        StatusTime: "2024-07-04T13:00:00",
        Source: "Test",
      },
    ],
    open: true,
    onClose: () => {},
    jobId: 1234,
  },
  render: (props) => {
    const [, updateArgs] = useArgs();
    props.onClose = () => updateArgs({ open: false });
    return <JobHistoryDialog {...props} />;
  },
};
