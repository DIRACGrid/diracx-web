import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  SplitActionButton,
  type ToolbarAction,
} from "../src/components/shared/DataTable/SplitActionButton";

function makeAction(overrides: Partial<ToolbarAction> = {}): ToolbarAction {
  return {
    label: "Delete",
    icon: <DeleteIcon />,
    onClick: jest.fn(),
    "data-testid": "delete-action",
    ...overrides,
  };
}

describe("SplitActionButton", () => {
  it("calls onClick with selected ids when some rows are selected", async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(
      <SplitActionButton
        action={makeAction({ onClick })}
        numSelected={2}
        selectedIds={[1, 2]}
        totalRows={100}
      />,
    );

    await user.click(screen.getByTestId("delete-action"));
    expect(onClick).toHaveBeenCalledWith([1, 2]);
  });

  it("acts on all matching rows when nothing is selected and no confirmation is required", async () => {
    const onClick = jest.fn();
    const fetchMatchingIds = jest.fn().mockResolvedValue([10, 20, 30]);
    const user = userEvent.setup();
    render(
      <SplitActionButton
        action={makeAction({ onClick })}
        numSelected={0}
        selectedIds={[]}
        totalRows={3}
        fetchMatchingIds={fetchMatchingIds}
      />,
    );

    await user.click(screen.getByTestId("delete-action"));

    await waitFor(() => {
      expect(fetchMatchingIds).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalledWith([10, 20, 30]);
    });
  });

  it("shows a confirmation dialog for destructive all-matching actions", async () => {
    const onClick = jest.fn();
    const fetchMatchingIds = jest.fn().mockResolvedValue([1, 2]);
    const user = userEvent.setup();
    render(
      <SplitActionButton
        action={makeAction({
          onClick,
          requiresConfirmation: true,
          confirmationMessage: (count) => `Really delete all ${count}?`,
        })}
        numSelected={0}
        selectedIds={[]}
        totalRows={2}
        fetchMatchingIds={fetchMatchingIds}
      />,
    );

    await user.click(screen.getByTestId("delete-action"));

    // Dialog appears with the custom message; onClick has not been called yet.
    expect(await screen.findByText("Really delete all 2?")).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
    expect(fetchMatchingIds).not.toHaveBeenCalled();
  });

  it("cancels the confirmation dialog without calling onClick", async () => {
    const onClick = jest.fn();
    const fetchMatchingIds = jest.fn().mockResolvedValue([1]);
    const user = userEvent.setup();
    render(
      <SplitActionButton
        action={makeAction({
          onClick,
          requiresConfirmation: true,
          confirmationMessage: "Confirm wipe?",
        })}
        numSelected={0}
        selectedIds={[]}
        totalRows={1}
        fetchMatchingIds={fetchMatchingIds}
      />,
    );

    await user.click(screen.getByTestId("delete-action"));
    await screen.findByText("Confirm wipe?");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText("Confirm wipe?")).not.toBeInTheDocument();
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(fetchMatchingIds).not.toHaveBeenCalled();
  });

  it("executes the action after confirming", async () => {
    const onClick = jest.fn();
    const fetchMatchingIds = jest.fn().mockResolvedValue([7, 8]);
    const user = userEvent.setup();
    render(
      <SplitActionButton
        action={makeAction({
          onClick,
          requiresConfirmation: true,
          confirmationMessage: "Confirm?",
        })}
        numSelected={0}
        selectedIds={[]}
        totalRows={2}
        fetchMatchingIds={fetchMatchingIds}
      />,
    );

    await user.click(screen.getByTestId("delete-action"));
    await screen.findByText("Confirm?");

    // The confirm button shares its label with the main action ("Delete").
    // Scope the query to the dialog to avoid the main button.
    const dialog = screen.getByRole("dialog");
    const confirmBtn = Array.from(dialog.querySelectorAll("button")).find(
      (b) => b.textContent === "Delete",
    );
    expect(confirmBtn).toBeDefined();
    await user.click(confirmBtn!);

    await waitFor(() => {
      expect(fetchMatchingIds).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalledWith([7, 8]);
    });
  });

  it("disables the default button when totalRows exceeds the MAX_BULK_RESULTS cap", () => {
    render(
      <SplitActionButton
        action={makeAction()}
        numSelected={0}
        selectedIds={[]}
        totalRows={20000}
        fetchMatchingIds={jest.fn()}
      />,
    );

    expect(screen.getByTestId("delete-action")).toBeDisabled();
  });
});
