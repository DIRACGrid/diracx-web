import { Meta, StoryObj } from "@storybook/react";
import { Paper } from "@mui/material";
import { createColumnHelper } from "@tanstack/react-table";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import {
  FilterForm,
  FilterFormProps,
} from "../src/components/shared/FilterForm";

interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<SimpleItem>();

const columnDefs = [
  columnHelper.accessor("id", {
    header: "ID",
    id: "id",
    meta: { type: "number" },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    id: "name",
    meta: { type: "string" },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    id: "email",
    meta: { type: "string" },
  }),
];

const meta: Meta<FilterFormProps<SimpleItem>> = {
  title: "shared/FilterForm",
  component: FilterForm,
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
    handleFilterChange: { control: { disable: true } },
    handleFilterMenuClose: { control: { disable: true } },
    selectedFilterId: { control: { disable: true } },
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
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: columnDefs,
    filters: [
      { id: 0, parameter: "id", operator: "eq", value: "1", isApplied: false },
    ],
    setFilters: () => {},
    handleFilterChange: () => {},
    handleFilterMenuClose: () => {},
    selectedFilterId: 0,
  },
};
