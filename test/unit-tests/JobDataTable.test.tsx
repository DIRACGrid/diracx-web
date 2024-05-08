import React from "react";
import { render } from "@testing-library/react";
import useSWR from "swr";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { JobDataTable } from "@/components/ui/JobDataTable";

// Mock modules
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
}));

const params = new URLSearchParams();

jest.mock("next/navigation", () => {
  return {
    usePathname: () => ({
      pathname: "",
    }),
    useRouter: () => ({
      push: jest.fn(),
    }),
    useSearchParams: () => params,
  };
});

jest.mock("swr", () => jest.fn());

// In your test file or a Jest setup file
jest.mock("jsoncrush", () => ({
  crush: jest.fn().mockImplementation((data) => `crushed-${data}`),
  uncrush: jest.fn().mockImplementation((data) => data.replace("crushed-", "")),
}));

describe("<JobDataTable />", () => {
  it("displays loading state", () => {
    (useSWR as jest.Mock).mockReturnValue({ data: null, error: null });
    (useOidcAccessToken as jest.Mock).mockReturnValue("1234");

    const { getByTestId } = render(<JobDataTable />);
    expect(getByTestId("skeleton")).toBeVisible();
  });

  it("displays error state", () => {
    (useSWR as jest.Mock).mockReturnValue({ error: true });

    const { getByText } = render(<JobDataTable />);
    expect(
      getByText("An error occurred while fetching data. Reload the page."),
    ).toBeInTheDocument();
  });

  it("displays no jobs data state", () => {
    (useSWR as jest.Mock).mockReturnValue({ data: [] });

    const { getByText } = render(<JobDataTable />);
    expect(
      getByText("No data or no results match your filters."),
    ).toBeInTheDocument();
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
