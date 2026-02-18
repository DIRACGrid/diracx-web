import { Meta, StoryObj } from "@storybook/nextjs";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ThemeProvider } from "../src/contexts/ThemeProvider";
import { DataTable, DataTableProps } from "../src/components/shared/DataTable";

import { CategoryType } from "../src";

interface SimpleItem extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<SimpleItem>();

const columnDefs = [
  columnHelper.accessor("id", {
    header: "ID",
    meta: { type: CategoryType.NUMBER },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    meta: { type: CategoryType.STRING },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    meta: { type: CategoryType.STRING },
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
    isLoading: false,
    toolbarComponents: <></>,
    menuItems: [{ label: "Edit", onClick: () => {} }],
  },
  render: function DataTableRender(args) {
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
