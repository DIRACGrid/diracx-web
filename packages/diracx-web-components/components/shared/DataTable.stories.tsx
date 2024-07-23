import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMUITheme } from "../../hooks/theme";
import { DataTable } from "./DataTable";

const meta = {
  title: "shared/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    page: { control: "number" },
    setPage: { control: false },
    rowsPerPage: { control: "number" },
    setRowsPerPage: { control: false },
    order: { control: "radio" },
    setOrder: { control: false },
    orderBy: { control: "text" },
    setOrderBy: { control: false },
    totalRows: { control: "number" },
    selected: { control: "object" },
    setSelected: { control: false },
    filters: { control: "object" },
    setFilters: { control: false },
    setSearchBody: { control: false },
    columns: { control: "object" },
    rows: { control: "object" },
    error: { control: "text" },
    isValidating: { control: "boolean" },
    isLoading: { control: "boolean" },
    rowIdentifier: { control: "text" },
    isMobile: { control: "boolean" },
    toolbarComponents: { control: false },
    menuItems: { control: "object" },
  },
  args: {},
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Story />
        </MUIThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: "900px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "Data Table",
    page: 0,
    setPage: () => {},
    rowsPerPage: 25,
    setRowsPerPage: () => {},
    order: "asc",
    setOrder: () => {},
    orderBy: "id",
    setOrderBy: () => {},
    totalRows: 1,
    selected: [],
    setSelected: () => {},
    filters: [],
    setFilters: () => {},
    setSearchBody: () => {},
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Name" },
      { id: "email", label: "Email" },
    ],
    rows: [{ id: 1, name: "John Doe", email: "john@example.com" }],
    error: "",
    isValidating: false,
    isLoading: false,
    rowIdentifier: "id",
    isMobile: false,
    toolbarComponents: <></>,
    menuItems: [{ label: "Edit", onClick: () => {} }],
  },
  render: (props) => {
    const [, updateArgs] = useArgs();
    props.setPage = (newPage) => {
      if (typeof newPage === "function") newPage = newPage(props.page);
      updateArgs({ page: newPage });
    };
    props.setRowsPerPage = (newRowsPerPage) => {
      if (typeof newRowsPerPage === "function")
        newRowsPerPage = newRowsPerPage(props.rowsPerPage);
      updateArgs({ rowsPerPage: newRowsPerPage });
    };
    props.setOrder = (newOrder) => {
      if (typeof newOrder === "function") newOrder = newOrder(props.order);
      updateArgs({ order: newOrder });
    };
    props.setOrderBy = (newOrderBy) => {
      if (typeof newOrderBy === "function")
        newOrderBy = newOrderBy(props.orderBy);
      updateArgs({ orderBy: newOrderBy });
    };
    props.setSelected = (newSelected) => {
      if (typeof newSelected === "function")
        newSelected = newSelected(props.selected);
      updateArgs({ selected: newSelected });
    };
    return <DataTable {...props} />;
  },
};
