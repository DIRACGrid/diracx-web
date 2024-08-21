import React from "react";
import { StoryObj, Meta } from "@storybook/react";
import { useArgs } from "@storybook/core/preview-api";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { Paper } from "@mui/material";
import { useMUITheme } from "../../hooks/theme";
import { FilterToolbar } from "./FilterToolbar";

const meta = {
  title: "shared/FilterToolbar",
  component: FilterToolbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "object" },
    filters: { control: "object" },
    setFilters: { control: "object" },
    handleApplyFilters: { control: "object" },
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
} satisfies Meta<typeof FilterToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Name" },
      { id: "age", label: "Age" },
    ],
    filters: [
      { id: 0, column: "id", operator: "eq", value: "1" },
      { id: 1, column: "id", operator: "neq", value: "2" },
    ],
    setFilters: () => {},
    handleApplyFilters: () => {},
    appliedFilters: [{ id: 0, column: "id", operator: "eq", value: "1" }],
  },
  render: (props) => {
    const [{ filters }, updateArgs] = useArgs();
    props.setFilters = (filters) => updateArgs({ filters });
    props.handleApplyFilters = () => updateArgs({ appliedFilters: filters });
    return <FilterToolbar {...props} />;
  },
};
