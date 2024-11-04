import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { DataTable, DataTableProps } from "../src/components/shared/DataTable";

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
const DataTableWrapper: React.FC<Omit<DataTableProps<SimpleItem>, "table">> = (
  props,
) => {
  const table = useReactTable<SimpleItem>({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable<SimpleItem> {...props} table={table} />;
};

const meta: Meta = {
  title: "shared/DataTable",
  component: DataTableWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    table: { control: false, description: "tan stack `Table`", required: true },
    totalRows: { control: "number" },
    searchBody: { control: false },
    setSearchBody: { control: false },
    error: { control: "text" },
    isValidating: { control: "boolean" },
    isLoading: { control: "boolean" },
    toolbarComponents: { control: false },
    menuItems: { control: "object" },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: "900px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Data Table",
    totalRows: data.length,
    searchBody: { sort: [{ parameter: "id", direction: "asc" }] },
    setSearchBody: () => {},
    error: null,
    isValidating: false,
    isLoading: false,
    toolbarComponents: <></>,
    menuItems: [{ label: "Edit", onClick: () => {} }],
  },
};
