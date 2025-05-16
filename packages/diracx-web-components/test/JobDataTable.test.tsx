import React from "react";
import { render } from "@testing-library/react";
import { VirtuosoMockContext } from "react-virtuoso";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { createColumnHelper } from "@tanstack/react-table";
import { JobDataTable } from "../src/components/JobMonitor/JobDataTable";
import { useJobs } from "../src/components/JobMonitor/JobDataService";
import { Job } from "../src/types";

// ——— Mock out OIDC + DataService hooks/funcs ———
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
}));

jest.mock("../src/components/JobMonitor/JobDataService", () => ({
  useJobs: jest.fn(),
  deleteJobs: jest.fn(),
  killJobs: jest.fn(),
  rescheduleJobs: jest.fn(),
  refreshJobs: jest.fn(),
  getJobHistory: jest.fn(),
}));

const columnHelper = createColumnHelper<Job>();

const columnDefs = [
  columnHelper.accessor("JobID", {
    id: "JobID",
    header: "Job ID",
    meta: { type: "string" },
  }),
  columnHelper.accessor("JobName", {
    id: "JobName",
    header: "Job Name",
    meta: { type: "string" },
  }),
  columnHelper.accessor("Status", {
    id: "Status",
    header: "Status",
    meta: { type: "string" },
  }),
  columnHelper.accessor("MinorStatus", {
    id: "MinorStatus",
    header: "Minor Status",
    meta: { type: "string" },
  }),
  columnHelper.accessor("SubmissionTime", {
    id: "SubmissionTime",
    header: "Submission Time",
    meta: { type: "date" },
  }),
];

const defaultProps = {
  searchBody: {
    search: [],
    sort: [{ parameter: "JobID", direction: "desc" as const }],
  },
  setSearchBody: jest.fn(),
  columns: columnDefs,
  pagination: { pageIndex: 0, pageSize: 25 },
  setPagination: jest.fn(),
  rowSelection: {},
  setRowSelection: jest.fn(),
  columnVisibility: {},
  setColumnVisibility: jest.fn(),
  columnPinning: { left: [] },
  setColumnPinning: jest.fn(),
};

describe("<JobDataTable />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // return shape matching: const { accessToken } = useOidcAccessToken(...)
    (useOidcAccessToken as jest.Mock).mockReturnValue({ accessToken: "1234" });
  });

  function renderWithProps(overrides = {}) {
    return render(
      <VirtuosoMockContext.Provider
        value={{ viewportHeight: 300, itemHeight: 100 }}
      >
        <JobDataTable {...defaultProps} {...overrides} />
      </VirtuosoMockContext.Provider>,
    );
  }

  it("displays the skeleton when `isValidating` is true", () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isValidating: true,
      isLoading: false,
    });

    const { getByTestId } = renderWithProps();
    expect(getByTestId("loading-skeleton")).toBeVisible();
  });

  it("displays the skeleton when `isLoading` is true", () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isValidating: false,
      isLoading: true,
    });

    const { getByTestId } = renderWithProps();
    expect(getByTestId("loading-skeleton")).toBeVisible();
  });

  it("displays the error message", () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: undefined,
      error: new Error("fetch-fail"),
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = renderWithProps();
    expect(
      getByText("An error occurred while fetching data. Reload the page."),
    ).toBeInTheDocument();
  });

  it("displays the no-data message when `data.data` is empty", () => {
    (useJobs as jest.Mock).mockReturnValue({
      data: { headers: new Headers(), data: [] },
      error: null,
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = renderWithProps();
    expect(
      getByText("No data or no results match your filters."),
    ).toBeInTheDocument();
  });

  it("renders rows when there is job data", () => {
    const headers = new Headers({ "content-range": "jobs 0-0/1" });
    const fakeData = {
      headers,
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

    (useJobs as jest.Mock).mockReturnValue({
      data: fakeData,
      error: null,
      isValidating: false,
      isLoading: false,
    });

    const { getByText } = renderWithProps();
    expect(getByText("TestJob1")).toBeInTheDocument();
  });
});
