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

const meta: Meta<DataTableProps<SimpleItem>> = {
  title: "shared/DataTable",
  component: DataTable,
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
        <div style={{ width: "900px", height: "500px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<DataTableProps<SimpleItem>>;

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
  render: (args) => {
    const table = useReactTable<SimpleItem>({
      data,
      columns: columnDefs,
      getCoreRowModel: getCoreRowModel(),
      state: {
        pagination: {
          pageIndex: 0,
          pageSize: 25,
        },
      },
    });
    return <DataTable<SimpleItem> {...args} table={table} />;
  },
};
