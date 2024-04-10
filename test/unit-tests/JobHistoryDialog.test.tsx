import React from "react";
import { render, screen } from "@testing-library/react";
import { JobHistoryDialog } from "@/components/ui/JobHistoryDialog";

describe("JobHistoryDialog", () => {
  const historyData = [
    {
      Status: "Received",
      MinorStatus: "",
      ApplicationStatus: "",
      StatusTime: "2022-01-01",
      Source: "Local",
    },
    {
      Status: "Killed",
      MinorStatus: "Job was killed",
      ApplicationStatus: "64",
      StatusTime: "2022-01-02",
      Source: "Site1",
    },
  ];

  it("renders the dialog with correct data", () => {
    render(
      <JobHistoryDialog
        open={true}
        onClose={jest.fn()}
        historyData={historyData}
      />,
    );

    // Dialog title
    const dialogTitle = screen.getByText("Job History");
    expect(dialogTitle).toBeInTheDocument();

    // Table headers
    const statusHeader = screen.getByText("Status");
    const minorStatusHeader = screen.getByText("Minor Status");
    const applicationStatusHeader = screen.getByText("Application Status");
    const statusTimeHeader = screen.getByText("Status Time");
    const sourceHeader = screen.getByText("Source");

    expect(statusHeader).toBeInTheDocument();
    expect(minorStatusHeader).toBeInTheDocument();
    expect(applicationStatusHeader).toBeInTheDocument();
    expect(statusTimeHeader).toBeInTheDocument();
    expect(sourceHeader).toBeInTheDocument();

    // History
    const statusCell = screen.getByText("Killed");
    const minorStatusCell = screen.getByText("Job was killed");
    const applicationStatusCell = screen.getByText("64");
    const statusTimeCell = screen.getByText("2022-01-01");
    const sourceCell = screen.getByText("Local");

    expect(statusCell).toBeInTheDocument();
    expect(minorStatusCell).toBeInTheDocument();
    expect(applicationStatusCell).toBeInTheDocument();
    expect(statusTimeCell).toBeInTheDocument();
    expect(sourceCell).toBeInTheDocument();
  });

  it("does not render the dialog because dialog is closed", () => {
    render(
      <JobHistoryDialog
        open={false}
        onClose={jest.fn()}
        historyData={historyData}
      />,
    );

    // Dialog title
    const dialogTitle = screen.queryByText("Job History");
    expect(dialogTitle).not.toBeInTheDocument();

    // Table headers
    const statusHeader = screen.queryByText("Status");
    const minorStatusHeader = screen.queryByText("Minor Status");
    const applicationStatusHeader = screen.queryByText("Application Status");
    const statusTimeHeader = screen.queryByText("Status Time");
    const sourceHeader = screen.queryByText("Source");

    expect(statusHeader).not.toBeInTheDocument();
    expect(minorStatusHeader).not.toBeInTheDocument();
    expect(applicationStatusHeader).not.toBeInTheDocument();
    expect(statusTimeHeader).not.toBeInTheDocument();
    expect(sourceHeader).not.toBeInTheDocument();

    // History
    const statusCell = screen.queryByText("Killed");
    const minorStatusCell = screen.queryByText("Job was killed");
    const applicationStatusCell = screen.queryByText("64");
    const statusTimeCell = screen.queryByText("2022-01-01");
    const sourceCell = screen.queryByText("Local");

    expect(statusCell).not.toBeInTheDocument();
    expect(minorStatusCell).not.toBeInTheDocument();
    expect(applicationStatusCell).not.toBeInTheDocument();
    expect(statusTimeCell).not.toBeInTheDocument();
    expect(sourceCell).not.toBeInTheDocument();
  });
});
