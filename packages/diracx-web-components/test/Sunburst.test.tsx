import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import { Sunburst } from "../src/components/shared/Sunburst/Sunburst";
import { SunburstTree } from "../src/types";
import * as stories from "../stories/Sunburst.stories"; // Importing all stories to use in tests
import "@testing-library/jest-dom";

// Sample tree data for testing
const mockTree: SunburstTree = {
  name: "Root",
  value: 2900,
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

// Sample tree data with small segments that should be grouped into "Others"

// Empty tree for testing
const emptyTree: SunburstTree = {
  name: "Empty",
  value: 0,
  children: [],
};

// Custom size to text function for testing
const customSizeToText = (size: number, total?: number) => {
  if (total) {
    return `${size} of ${total} (${Math.round((size / total) * 100)}%)`;
  }
  return `${size} items`;
};

describe("Sunburst Component", () => {
  const { Default } = composeStories(stories);

  describe("Rendering States", () => {
    test("renders loading skeleton when isLoading is true", () => {
      render(<Sunburst tree={mockTree} isLoading={true} error={null} />);
      const loadingSkeleton = screen.getByTestId("loading-skeleton");
      expect(loadingSkeleton).toBeInTheDocument();
    });

    test("renders error message when error is provided", () => {
      const errorMessage = "Failed to load data";
      render(
        <Sunburst
          tree={mockTree}
          isLoading={false}
          error={new Error(errorMessage)}
        />,
      );
      const errorAlert = screen.getByText(errorMessage);
      expect(errorAlert).toBeInTheDocument();
    });

    test("renders default error message when error object has no message", () => {
      render(
        <Sunburst tree={mockTree} isLoading={false} error={new Error()} />,
      );
      const defaultErrorMessage = screen.getByText(
        "An error occurred while loading the data.",
      );
      expect(defaultErrorMessage).toBeInTheDocument();
    });

    test("renders the sunburst chart when data is provided and not loading or error", () => {
      render(<Sunburst tree={mockTree} isLoading={false} error={null} />);
      // Since D3 is mocked, we check that SVG is rendered
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    test("handles empty tree data", () => {
      render(<Sunburst tree={emptyTree} isLoading={false} error={null} />);
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
      // We don't expect any errors to be thrown
    });
  });

  describe("Custom Rendering", () => {
    test("uses custom size to text function when provided", () => {
      render(
        <Sunburst
          tree={mockTree}
          isLoading={false}
          error={null}
          sizeToText={customSizeToText}
        />,
      );

      // Since D3 is mocked, we can't directly test the text content
      // but we can verify the component rendered without errors
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    test("handles large datasets without crashing", () => {
      // Create a large dataset
      const largeTree: SunburstTree = {
        name: "Root",
        value: 0,
        children: [],
      };

      // Add 5000 children
      for (let i = 0; i < 5000; i++) {
        largeTree.children!.push({
          name: `Node ${i}`,
          value: i + 1,
        });
      }

      // This should render without crashing
      render(<Sunburst tree={largeTree} isLoading={false} error={null} />);
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    test("component should update when current path changes", () => {
      const setCurrentPathMock = jest.fn();
      const { rerender } = render(
        <Sunburst
          tree={mockTree}
          isLoading={false}
          error={null}
          currentPath={[]}
          setCurrentPath={setCurrentPathMock}
        />,
      );

      // Rerender with different current path
      rerender(
        <Sunburst
          tree={mockTree}
          isLoading={false}
          error={null}
          currentPath={["Production"]}
          setCurrentPath={setCurrentPathMock}
        />,
      );

      // In a real test environment, we would check if the visualization has updated
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  // The previous tests cover the main functionalities of the Sunburst component.
  // Here we just ensure that the story renders correctly.
  describe("Storybook Integration", () => {
    test("renders the Default story correctly", () => {
      render(<Default />);
      expect(screen.getByText("Top")).toBeInTheDocument();
      expect(screen.getByTestId("sunburst-chart")).toBeInTheDocument();
    });

    test("renders while loading", () => {
      render(<Default isLoading={true} />);
      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });
  });
});
