import React from "react";
import { StoryObj } from "@storybook/react";
import { Paper } from "@mui/material";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import { FilterForm, FilterFormProps } from "./FilterForm";

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
const FilterFormWrapper: React.FC<
  Omit<FilterFormProps<SimpleItem>, "columns">
> = (props) => {
  const table = useReactTable<SimpleItem>({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  });

  return <FilterForm<SimpleItem> {...props} columns={table.getAllColumns()} />;
};

const meta = {
  title: "shared/FilterForm",
  component: FilterFormWrapper,
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
    handleFilterChange: { control: "object" },
    handleFilterMenuClose: { control: "object" },
    selectedFilterId: { control: "number" },
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
    filters: [{ id: 0, parameter: "id", operator: "eq", value: "1" }],
    setFilters: () => {},
    handleFilterChange: () => {},
    handleFilterMenuClose: () => {},
    selectedFilterId: 0,
  },
};
