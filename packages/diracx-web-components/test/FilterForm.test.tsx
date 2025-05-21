import { render, screen, fireEvent, within } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import * as stories from "../stories/FilterForm.stories";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default } = composeStories(stories);

describe("FilterForm", () => {
  it("renders the filter form with correct initial values", () => {
    render(<Default />);
    // By default: ID = 1, operator = "equals to", value = "1"
    expect(
      screen.getByTestId("filter-form-select-parameter"),
    ).toHaveTextContent("ID");
    expect(screen.getByTestId("filter-form-select-operator")).toHaveTextContent(
      "equals to",
    );
    expect(screen.getByLabelText("Value")).toHaveValue(1);
  });

  it("allows changing the value", () => {
    render(<Default />);
    const valueInput = screen.getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "42" } });
    expect(valueInput).toHaveValue(42);
  });

  it("allows changing the parameter (column)", () => {
    render(<Default />);
    const columnSelect = screen.getByTestId("filter-form-select-parameter");
    const button = within(columnSelect).getByRole("combobox");
    fireEvent.mouseDown(button);
    fireEvent.click(screen.getByText("Name"));
    expect(columnSelect).toHaveTextContent("Name");
  });

  it("allows changing the operator", () => {
    render(<Default />);
    const operatorSelect = screen.getByTestId("filter-form-select-operator");
    const button = within(operatorSelect).getByRole("combobox");
    fireEvent.mouseDown(button);
    fireEvent.click(screen.getByText("not equals to"));
    expect(operatorSelect).toHaveTextContent("not equals to");
  });
});
