import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { composeStories } from "@storybook/react";
import { VirtuosoMockContext } from "react-virtuoso";
import * as stories from "../stories/JobMonitor.stories";

// Compose Storybook stories (includes all decorators/args)
const { Default, Loading, Empty, Error } = composeStories(stories);

jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("JobMonitor", () => {
  it("renders the job monitor component", async () => {
    const { getByTestId, getByText } = render(<Default />);

    expect(getByTestId("add-filter-button")).toBeInTheDocument();
    expect(getByTestId("apply-filters-button")).toBeInTheDocument();
    expect(getByTestId("clear-filters-button")).toBeInTheDocument();

    // Verify job data is displayed
    await waitFor(() => {
      expect(getByText("List of Jobs")).toBeInTheDocument();
    });
  });

  it("renders loading state while fetching data", () => {
    const { getByTestId } = render(<Loading />);

    // Verify loading state
    expect(getByTestId("loading-skeleton")).toBeInTheDocument();
  });

  it("renders error state when data fetch fails", () => {
    const { getByText } = render(<Error />);

    // Verify error message
    expect(
      getByText("An error occurred while fetching data. Reload the page."),
    ).toBeInTheDocument();
  });

  it("renders empty state when no jobs are found", () => {
    const { getByText } = render(<Empty />);

    // Verify empty state message
    expect(
      getByText("No data or no results match your filters."),
    ).toBeInTheDocument();
  });
});

describe("JobDataTable", () => {
  it("displays job data with correct columns", async () => {
    const { getByText } = render(
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 300, itemHeight: 100 }}
      >
        <Default />
      </VirtuosoMockContext.Provider>,
    );

    // Verify table headers
    expect(getByText("ID")).toBeInTheDocument();
    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Name")).toBeInTheDocument();

    // Verify job data is displayed
    await waitFor(() => {
      expect(getByText("Job 1")).toBeInTheDocument();
      expect(getByText("Job accepted")).toBeInTheDocument();
    });
  });
});

describe("JobHistoryDialog", () => {
  it("renders the dialog with correct data", async () => {
    const { getByText } = render(
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 300, itemHeight: 100 }}
      >
        <Default />
      </VirtuosoMockContext.Provider>,
    );

    await act(async () => {
      fireEvent.contextMenu(getByText("Job 1"));
    });

    // Now wait for the context menu to appear and click Get history
    await act(async () => {
      fireEvent.click(getByText("Get history"));
      // Allow time for state updates to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Now check for the dialog
    await waitFor(() => {
      expect(screen.getByText(/Job History:/)).toBeInTheDocument();
    });
  });
});
