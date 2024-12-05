import React from "react";
import { render } from "@testing-library/react";
import useSWR from "swr";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { VirtuosoMockContext } from "react-virtuoso";
import { JobDataTable } from "@/components/JobMonitor/JobDataTable";

// Mock modules
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
}));

jest.mock("swr", () => jest.fn());

// In your test file or a Jest setup file
jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("<JobDataTable />", () => {
  it("displays loading state when data is being validated", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isValidating: true,
      isLoading: false,
    });
    (useOidcAccessToken as jest.Mock).mockReturnValue("1234");

    const { getByTestId } = render(<JobDataTable />);
    expect(getByTestId("loading-skeleton")).toBeVisible();
  });

  it("displays loading state when data is being loaded", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: null,
      isValidating: false,
      isLoading: true,
    });
    (useOidcAccessToken as jest.Mock).mockReturnValue("1234");

    const { getByTestId } = render(<JobDataTable />);
    expect(getByTestId("loading-skeleton")).toBeVisible();
  });

  it("displays error state", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: null,
      error: true,
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = render(<JobDataTable />);
    expect(
      getByText("An error occurred while fetching data. Reload the page."),
    ).toBeInTheDocument();
  });

  it("displays no jobs data state", () => {
    (useSWR as jest.Mock).mockReturnValue({
      data: [],
      error: false,
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = render(<JobDataTable />);
    expect(
      getByText("No data or no results match your filters."),
    ).toBeInTheDocument();
  });

  it("displays jobs data in the grid", () => {
    const mockData = {
      data: [
        {
          JobID: "1",
          JobName: "TestJob1",
          Status: "Running",
          MinorStatus: "Processing",
          SubmissionTime: "2023-10-13",
        },
      ],
    };
    (useSWR as jest.Mock).mockReturnValue({
      data: mockData,
      error: false,
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = render(<JobDataTable />, {
      wrapper: ({ children }) => (
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 300, itemHeight: 100 }}
        >
          {children}
        </VirtuosoMockContext.Provider>
      ),
    });
    expect(getByText("TestJob1")).toBeInTheDocument();
  });
});
