import React from "react";
import { StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { Paper } from "@mui/material";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import { FilterToolbar, FilterToolbarProps } from "./FilterToolbar";

interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<SimpleItem>();

const columnDefs = [
  columnHelper.accessor("id", {
    header: "ID",
    meta: { type: "number" },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    meta: { type: "string" },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    meta: { type: "string" },
  }),
];

const data: SimpleItem[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
];

// Wrapper component to initialize the table
const FilterToolbarWrapper: React.FC<
  Omit<FilterToolbarProps<SimpleItem>, "columns">
> = (props) => {
  const table = useReactTable<SimpleItem>({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <FilterToolbar<SimpleItem> {...props} columns={table.getAllColumns()} />
  );
};

const meta = {
  title: "shared/FilterToolbar",
  component: FilterToolbarWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: false,
      description: "`array` of tan stack `Column`",
      required: true,
    },
    filters: { control: "object" },
    setFilters: { control: "object" },
    handleApplyFilters: { control: "object" },
    handleClearFilters: { control: "object" },
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
    filters: [
      { id: 0, parameter: "id", operator: "eq", value: "1" },
      { id: 1, parameter: "id", operator: "neq", value: "2" },
    ],
    setFilters: () => {},
    handleApplyFilters: () => {},
    handleClearFilters: () => {},
    appliedFilters: [{ id: 0, parameter: "id", operator: "eq", value: "1" }],
  },
  render: (props) => {
    const [{ filters }, updateArgs] = useArgs();
    props.setFilters = (filters) => updateArgs({ filters });
    props.handleApplyFilters = () => updateArgs({ appliedFilters: filters });
    return <FilterToolbarWrapper {...props} />;
  },
};
