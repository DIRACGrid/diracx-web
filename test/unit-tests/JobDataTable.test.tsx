import React from "react";
import { render } from "@testing-library/react";
import { JobDataTable } from "@/components/ui/JobDataTable";
import useSWR from "swr";
import { useOidcAccessToken } from "@axa-fr/react-oidc";

// Mock the module
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
}));

jest.mock("swr", () => jest.fn());

describe("<JobDataTable />", () => {
  it("displays loading state", () => {
    (useSWR as jest.Mock).mockReturnValue({ data: null, error: null });
    (useOidcAccessToken as jest.Mock).mockReturnValue("1234");

    const { getByText } = render(<JobDataTable />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  it("displays error state", () => {
    (useSWR as jest.Mock).mockReturnValue({ error: true });

    const { getByText } = render(<JobDataTable />);
    expect(
      getByText("An error occurred while fetching jobs"),
    ).toBeInTheDocument();
  });

  it("displays no jobs data state", () => {
    (useSWR as jest.Mock).mockReturnValue({ data: [] });

    const { getByText } = render(<JobDataTable />);
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
    (useSWR as jest.Mock).mockReturnValue({ data: mockData });

    const { getByText } = render(<JobDataTable />);
    expect(getByText("TestJob1")).toBeInTheDocument();
  });
});
