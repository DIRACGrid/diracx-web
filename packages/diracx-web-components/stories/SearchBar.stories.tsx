import { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Paper } from "@mui/material";
import { action } from "@storybook/addon-actions";
import {
  SearchBar,
  SearchBarProps,
} from "../src/components/shared/SearchBar/SearchBar";
import {
  InternalFilter,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBarSuggestions,
} from "../src/types";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

// Exemples d'équations de tokens
const sampleFilters: InternalFilter[] = [
  {
    id: 0,
    operator: "eq",
    parameter: "JobID",
    value: "12345",
  },
  {
    id: 1,
    operator: "in",
    parameter: "Status",
    values: ["Running", "Completed"],
  },
];

const createSuggestions = async (
  previousToken: SearchBarToken | undefined,
  previousEquation: SearchBarTokenEquation | undefined,
): Promise<SearchBarSuggestions> => {
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
      type: [
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
      ],
    };

  if (previousToken.type.startsWith("category"))
    return {
      items: ["=", "!=", "in", "not in", "like", "<", ">"],
      type: Array(50).fill("operator_string"),
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
    type: Array(items.length).fill("value"),
  };
};

const meta: Meta<SearchBarProps> = {
  title: "shared/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    filters: {
      description: "`array` of `InternalFilter`",
      table: {
        type: { summary: "InternalFilter[]" },
      },
    },
    setFilters: {
      description: "`function` to set the `filters`",
      table: {
        type: { summary: "function" },
      },
    },
    createSuggestions: {
      description: `Asynchronous function used to generate suggestion items in the search bar.

#### Parameters:
- \`previousToken\` *(optional)*: the token currently selected by the user (e.g. a category or operator).
- \`previousEquation\` *(optional)*: the full list of tokens entered before, used to provide context-aware suggestions.

#### Returns:
- A promise that resolves to a \`SearchBarSuggestions\` object containing the suggested items and their types.

#### Signature:`,
    },
    searchFunction: {
      description: `Optional function triggered when the search is executed.

#### Parameters:
- \`equations\`: An array of \`SearchBarTokenEquation\` representing the user's search query, fully parsed into tokens.
- \`setFilters\`: A React state setter used to update the internal filters based on the equations.

#### Notes:
- You can use this function to transform the search expression into an internal filter format used by your application.
- This function is optional — if not provided, the search bar will use a default function that converts the equations to internal filters.

#### Signature:`,
    },
    clearFunction: {
      description: `\`function\` to call when the search is cleared
      
#### Signature:`,
    },
    allowKeyWordSearch: {
      control: { type: "boolean" },
      description: "`boolean` to allow keyword search or not",
      defaultValue: true,
    },
  },
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
type Story = StoryObj<SearchBarProps>;

export const Default: Story = {
  args: {
    filters: [],
  },
  render: (args) => {
    const [filters, setFilters] = useState<InternalFilter[]>(args.filters);

    return (
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        createSuggestions={createSuggestions}
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
    const [filters, setFilters] = useState<InternalFilter[]>(args.filters);

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

export const NoKeywordSearch: Story = {
  args: {
    filters: [],
    setFilters: action("setFilters"),
    searchFunction: action("searchTriggered"),
    allowKeyWordSearch: false,
  },
  render: (args) => {
    const [filters, setFilters] = useState<InternalFilter[]>(args.filters);

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

export const CustomClearFunction: Story = {
  args: {
    filters: [],
    setFilters: action("setFilters"),
    searchFunction: action("searchTriggered"),
    clearFunction: (setFilters) => {
      setFilters([]);
      action("clearFunction")();
    },
    allowKeyWordSearch: false,
  },
  render: (args) => {
    const [filters, setFilters] = useState<InternalFilter[]>(args.filters);

    function customClearFunction(
      _setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>,
      setTokenEquations: React.Dispatch<
        React.SetStateAction<SearchBarTokenEquation[]>
      >,
    ) {
      setTokenEquations((prev) => prev.filter((eq) => eq.status === "valid"));
    }
    return (
      <>
        <p>Remove only the invalid equations</p>
        <SearchBar
          {...args}
          filters={filters}
          setFilters={setFilters}
          createSuggestions={createSuggestions}
          clearFunction={customClearFunction}
        />
      </>
    );
  },
};
