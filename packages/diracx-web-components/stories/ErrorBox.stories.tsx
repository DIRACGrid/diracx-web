import type { Meta, StoryObj } from "@storybook/react";

import { ErrorBox } from "../src/components/shared/ErrorBox";

const meta = {
  title: "Shared/ErrorBox",
  component: ErrorBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
} satisfies Meta<typeof ErrorBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
