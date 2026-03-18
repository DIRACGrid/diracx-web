import { render, screen, fireEvent } from "@testing-library/react";
import { PieChart } from "../src/components/shared/PieChart";

describe("PieChart legend click", () => {
  it("fires onItemClick with the item id", () => {
    const onItemClick = jest.fn();
    render(
      <PieChart
        data={[
          { id: "Failed", value: 44, label: "Failed" },
          { id: "Running", value: 10, label: "Running" },
        ]}
        onItemClick={onItemClick}
        centerLabel="jobs"
      />,
    );
    fireEvent.click(screen.getByText("Running"));
    expect(onItemClick).toHaveBeenCalledWith("Running");
    fireEvent.keyDown(screen.getByText("Failed").closest("[role=button]")!, {
      key: "Enter",
    });
    expect(onItemClick).toHaveBeenCalledWith("Failed");
  });
});
