import React from "react";
import { render } from "@testing-library/react";
import { JobDataGrid } from "@/components/ui/JobDataGrid";
import { useJobs } from "@/hooks/jobs";

// Mocking the useJobs hook
jest.mock("../../src/hooks/jobs");

describe("<JobDataGrid />", () => {
  it("displays loading state", () => {
    (useJobs as jest.Mock).mockReturnValue({ isLoading: true });

    const { getByText } = render(<JobDataGrid />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  it("displays error state", () => {
    (useJobs as jest.Mock).mockReturnValue({ error: true });

    const { getByText } = render(<JobDataGrid />);
    expect(
      getByText("An error occurred while fetching jobs."),
    ).toBeInTheDocument();
  });

  it("displays no jobs data state", () => {
    (useJobs as jest.Mock).mockReturnValue({ data: [] });

    const { getByText } = render(<JobDataGrid />);
    expect(getByText("No job submitted.")).toBeInTheDocument();
  });

  it("displays jobs data in the grid", () => {
    const mockData = [
      {
        JobID: "1",
        JobName: "TestJob1",
        Status: "Running",
        MinorStatus: "Processing",
        SubmissionTime: "2023-10-13",
      },
    ];
    (useJobs as jest.Mock).mockReturnValue({ data: mockData });

    const { getByText } = render(<JobDataGrid />);
    expect(getByText("TestJob1")).toBeInTheDocument();
  });
});
