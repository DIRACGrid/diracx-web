import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState, useEffect } from "react";
import { Sunburst } from "../src/components/shared/Sunburst/Sunburst";

// Mock data for the story
const mockTree = {
  name: "",
  children: [
    {
      name: "Production",
      value: 1500,
      children: [
        { name: "Running", value: 800 },
        { name: "Completed", value: 500 },
        { name: "Failed", value: 200 },
      ],
    },
    {
      name: "Development",
      value: 800,
      children: [
        { name: "Testing", value: 400 },
        { name: "Debugging", value: 300 },
        { name: "Review", value: 100 },
      ],
    },
    {
      name: "Maintenance",
      value: 600,
      children: [
        { name: "Updates", value: 300 },
        { name: "Backups", value: 200 },
        { name: "Monitoring", value: 100 },
      ],
    },
  ],
};

function customSizeToText(size: number): string {
  return `${size} owners`;
}

function customColorScales(name: string, _size: number, depth: number) {
  // Custom color logic based on depth and name
  const colors = {
    0: "#FF6B6B", // Root level
    1: "#4ECDC4", // First level
    2: "#45B7D1", // Second level
  };

  // Different colors for different categories
  if (name.includes("Production")) return "#FF6B6B";
  if (name.includes("Development")) return "#4ECDC4";
  if (name.includes("Maintenance")) return "#45B7D1";
  if (name.includes("Running")) return "#2ECC71";
  if (name.includes("Failed")) return "#E74C3C";
  if (name.includes("Completed")) return "#F39C12";

  return colors[depth as keyof typeof colors] || "#95A5A6";
}

const meta: Meta<typeof Sunburst> = {
  title: "Shared/Sunburst",
  component: Sunburst,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A D3-based sunburst chart for hierarchical data visualization.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "500px", height: "500px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tree: mockTree,
    error: null,
    isLoading: false,
    hasHiddenLevels: false,
    sizeToText: undefined,
    colorScales: undefined,
  },
  argTypes: {
    tree: {
      control: "select",
      options: ["Default", "Empty"],
      mapping: {
        Default: mockTree,
        Empty: { name: "", children: [] },
      },
    },
    sizeToText: {
      control: "select",
      options: ["Default", "Custom"],
      mapping: {
        Default: undefined,
        Custom: customSizeToText,
      },
    },
    colorScales: {
      control: "select",
      options: ["Default", "Custom"],
      mapping: {
        Default: undefined,
        Custom: customColorScales,
      },
    },
    error: {
      control: "select",
      options: ["None", "Error", "Custom Error"],
      mapping: {
        None: null,
        Error: new Error(),
        "Custom Error": new Error("Custom error message"),
      },
    },
  },

  render: function SunburstRender(args) {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [tree, setTree] = useState(args.tree);

    useEffect(() => {
      if (currentPath.length === 0) {
        setTree(args.tree);
        return;
      }
      const newChildren =
        mockTree.children.filter(
          (child) => currentPath[currentPath.length - 1] === child.name,
        )[0]?.children || [];
      const newTree = {
        name: "",
        children: newChildren,
      };

      setTree(newTree);
    }, [currentPath, args.tree]);

    return (
      <Sunburst
        tree={tree}
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
        error={args.error}
        isLoading={args.isLoading}
        hasHiddenLevels={args.hasHiddenLevels}
        sizeToText={args.sizeToText}
        colorScales={args.colorScales}
      />
    );
  },
};
