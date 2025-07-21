import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";
import { ChartDisplayLayout } from "../src/components/shared/ChartDisplayLayout";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { Sunburst } from "../src/components";

// Mock data for the story
const mockTree = {
  name: "",
  children: [
    {
      name: "Production",
      value: 1500,
      children: [
        { name: "Running", value: 800 },
        { name: "Completed", value: 500 },
        { name: "Failed", value: 200 },
      ],
    },
    {
      name: "Development",
      value: 800,
      children: [
        { name: "Testing", value: 400 },
        { name: "Debugging", value: 300 },
        { name: "Review", value: 100 },
      ],
    },
    {
      name: "Maintenance",
      value: 600,
      children: [
        { name: "Updates", value: 300 },
        { name: "Backups", value: 200 },
        { name: "Monitoring", value: 100 },
      ],
    },
  ],
};

const meta = {
  title: "Shared/ChartDisplayLayout",
  component: ChartDisplayLayout,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
} satisfies Meta<typeof ChartDisplayLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chart: <div>Nothing</div>,
    columnList: ["Column 1", "Column 2", "Column 3"],
    groupColumns: ["Column 1"],
    setGroupColumns: () => {},
    currentPath: [],
    setCurrentPath: () => {},
    defaultColumns: ["Column 1"],
    title: "Select Columns",
  },
  argTypes: {
    chart: {
      control: { type: "select" },
      options: ["Sunburst", "None"],
      mapping: {
        Sunburst: <Sunburst tree={mockTree} />,
        None: <div>No Chart</div>,
      },
    },
    setGroupColumns: {
      control: { disable: true },
    },
    setCurrentPath: {
      control: { disable: true },
    },
  },
  render: (args) => {
    const [groupColumns, setGroupColumns] = useState(args.groupColumns);
    const [currentPath, setCurrentPath] = useState(args.currentPath);

    return (
      <ThemeProvider>
        <ChartDisplayLayout
          chart={args.chart}
          columnList={args.columnList}
          groupColumns={groupColumns}
          setGroupColumns={setGroupColumns}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          defaultColumns={args.defaultColumns}
          title={args.title}
        />
      </ThemeProvider>
    );
  },
};
