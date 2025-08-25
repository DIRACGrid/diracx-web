import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Paper } from "@mui/material";
import { action } from "@storybook/addon-actions";
import {
  SearchBar,
  SearchBarProps,
} from "../src/components/shared/SearchBar/SearchBar";
import {
  Filter,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBarSuggestions,
  EquationStatus,
} from "../src/types";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

// Exemples d'équations de tokens
const sampleFilters: Filter[] = [
  {
    operator: "eq",
    parameter: "JobID",
    value: "12345",
  },
  {
    operator: "in",
    parameter: "Status",
    values: ["Running", "Completed"],
  },
];
function customClearFunction(
  _setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
  setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  >,
) {
  setTokenEquations((prev) =>
    prev.filter((eq) => eq.status === EquationStatus.VALID),
  );
}

const createSuggestions = async ({
  previousToken,
  previousEquation,
}: {
  previousToken?: SearchBarToken;
  previousEquation?: SearchBarTokenEquation;
}): Promise<SearchBarSuggestions> => {
  // Simulate fetching suggestions based on the previous token and equation
  if (
    !previousToken ||
    !previousEquation ||
    previousToken.type.startsWith("custom") ||
    previousToken.type.startsWith("value")
  )
    return {
      items: [
        "JobID",
        "Status",
        "Site",
        "JobType",
        "JobGroup",
        "UserPriority",
        "RescheduleCounter",
      ],
      type: Array(7).fill("string"),
      nature: Array(7).fill("category"),
    };

  if (previousToken.nature === "category")
    return {
      items: ["=", "!=", "in", "not in", "like", "<", ">"],
      type: Array(50).fill("string"),
      nature: Array(50).fill("operator"),
    };

  let items: string[] = [];
  switch (previousEquation.items[0].label) {
    case "JobID":
      items = ["12345", "67890", "54321"];
      break;
    case "Status":
      items = ["Running", "Completed", "Failed", "Pending"];
      break;
    case "Site":
      items = ["Site A", "Site B", "Site C"];
      break;
    case "JobType":
      items = ["Type A", "Type B", "Type C"];
      break;
    case "JobGroup":
      items = ["Group A", "Group B", "Group C"];
      break;
    case "UserPriority":
      items = ["1", "2", "3"];
      break;
    case "RescheduleCounter":
      items = ["0", "1", "2"];
      break;
    default:
      items = [];
  }

  return {
    items: items,
    type: Array(items.length).fill("string"),
    nature: Array(items.length).fill("value"),
  };
};

const meta: Meta<SearchBarProps<string>> = {
  title: "shared/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Paper sx={{ p: 2, minWidth: 600 }}>
          <Story />
        </Paper>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<SearchBarProps<string>>;

export const Default: Story = {
  args: {
    filters: [],
    clearFunction: customClearFunction,
  },
  argTypes: {
    clearFunction: {
      control: "select",
      options: ["CustomClearFunction", "Default"],
      mapping: {
        customClearFunction: customClearFunction,
        default: undefined,
      },
    },
  },
  render: (args) => {
    const [filters, setFilters] = useState<Filter[]>(args.filters);

    return (
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        createSuggestions={createSuggestions}
        clearFunction={args.clearFunction}
      />
    );
  },
};

export const WithPrefilledTokens: Story = {
  args: {
    filters: sampleFilters,
    setFilters: action("setFilters"),
    searchFunction: action("searchTriggered"),
    allowKeyWordSearch: true,
  },
  render: (args) => {
    const [filters, setFilters] = useState<Filter[]>(args.filters);

    return (
      <SearchBar
        {...args}
        filters={filters}
        setFilters={setFilters}
        createSuggestions={createSuggestions}
      />
    );
  },
};
