import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { useMUITheme } from "../../hooks/theme";
import { FilterForm } from "./FilterForm";

const meta = {
  title: "shared/FilterForm",
  component: FilterForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "object" },
    filters: { control: "object" },
    setFilters: { control: "object" },
    handleFilterChange: { control: "object" },
    handleFilterMenuClose: { control: "object" },
    selectedFilterId: { control: "number" },
  },
  decorators: [
    (Story) => {
      const theme = useMUITheme();
      return (
        <MUIThemeProvider theme={theme}>
          <Paper sx={{ p: 2 }}>
            <Story />
          </Paper>
        </MUIThemeProvider>
      );
    },
  ],
} satisfies Meta<typeof FilterForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Name" },
      { id: "age", label: "Age" },
    ],
    filters: [{ id: 0, column: "id", operator: "eq", value: "1" }],
    setFilters: () => {},
    handleFilterChange: () => {},
    handleFilterMenuClose: () => {},
    selectedFilterId: 0,
  },
};
