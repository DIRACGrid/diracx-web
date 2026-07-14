import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Typography } from "@mui/material";

import {
  PieChart,
  PieChartItem,
} from "../src/components/shared/PieChart/PieChart";

const meta: Meta<typeof PieChart> = {
  title: "Shared/PieChart",
  component: PieChart,
};

export default meta;
type Story = StoryObj<typeof PieChart>;

const jobData: PieChartItem[] = [
  { id: "Waiting", value: 795, label: "Waiting", color: "#ffa726" },
  { id: "Failed", value: 17, label: "Failed", color: "#f44336" },
];

export const Default: Story = {
  args: {
    data: jobData,
    centerLabel: "jobs",
  },
};

/**
 * Interactive story used by the e2e legend-click test: clicking a slice or
 * a legend entry renders the clicked id below the chart.
 */
export const Clickable: Story = {
  render: function ClickableStory() {
    const [clicked, setClicked] = useState<string | null>(null);
    return (
      <div>
        <PieChart
          data={jobData}
          centerLabel="jobs"
          onItemClick={(id) => setClicked(id)}
        />
        <Typography data-testid="clicked-result">
          {clicked ? `clicked: ${clicked}` : "nothing clicked"}
        </Typography>
      </div>
    );
  },
};
