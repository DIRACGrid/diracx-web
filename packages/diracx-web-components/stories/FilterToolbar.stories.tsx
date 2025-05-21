import { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { Paper } from "@mui/material";
import { createColumnHelper } from "@tanstack/react-table";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import {
  FilterToolbar,
  FilterToolbarProps,
} from "../src/components/shared/FilterToolbar";

interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<SimpleItem>();

const columnDefs = [
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    meta: { type: "number" },
  }),
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    meta: { type: "string" },
  }),
  columnHelper.accessor("email", {
    id: "email",
    header: "Email",
    meta: { type: "string" },
  }),
];

const meta: Meta<FilterToolbarProps<SimpleItem>> = {
  title: "shared/FilterToolbar",
  component: FilterToolbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { disable: true },
      description: "`array` of tan stack `Column`",
      required: true,
    },
    filters: { control: { disable: true } },
    setFilters: { control: { disable: true } },
    handleApplyFilters: { control: { disable: true } },
    handleClearFilters: { control: { disable: true } },
  },
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
  ],
};

export default meta;
type Story = StoryObj<FilterToolbarProps<SimpleItem>>;

export const Default: Story = {
  args: {
    columns: columnDefs,
    filters: [
      { id: 0, parameter: "id", operator: "eq", value: "1", isApplied: true },
      { id: 1, parameter: "id", operator: "neq", value: "2", isApplied: false },
    ],
    setFilters: () => {},
    handleApplyFilters: () => {},
    handleClearFilters: () => {},
  },
  render: (props) => {
    const [{ filters }, updateArgs] = useArgs();
    props.setFilters = (filters) => updateArgs({ filters });
    props.handleApplyFilters = () => updateArgs({ appliedFilters: filters });
    return <FilterToolbar<SimpleItem> {...props} />;
  },
};
