import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import userEvent from "@testing-library/user-event";
import * as stories from "../stories/SearchBar.stories";
import { SearchBar } from "../src/components/shared/SearchBar/SearchBar";
import type {
  Filter,
  SearchBarSuggestions,
  SearchBarToken,
  SearchBarTokenEquation,
} from "../src/types";

// Compose the stories to get actual Storybook behavior (decorators, args, etc)
const { Default, WithPrefilledTokens } = composeStories(stories);

const emptySuggestions: SearchBarSuggestions = {
  items: [],
  type: [],
  nature: [],
};

const noopSuggestions = async (_: {
  previousToken?: SearchBarToken;
  previousEquation?: SearchBarTokenEquation;
}) => emptySuggestions;

describe("SearchBar", () => {
  it("renders the component", async () => {
    render(<Default />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter a category"),
      ).toBeInTheDocument();
    });
  });

  it("renders with preffiled tokens", async () => {
    render(<WithPrefilledTokens />);
    await waitFor(() => {
      expect(screen.getByText("12345")).toBeInTheDocument();
      expect(screen.getByText("Running | Completed")).toBeInTheDocument();
    });
  });

  it("shows autocomplete suggestions when clicking in search field", async () => {
    const user = userEvent.setup();
    render(<Default />);

    const searchInput = screen.getByPlaceholderText("Enter a category");

    // Click in the search field
    await user.click(searchInput);

    // Type to trigger autocomplete
    await user.type(searchInput, "S");

    // Check if suggestions appear
    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    // Check if Site suggestion also appears
    expect(screen.getByText("Site")).toBeInTheDocument();
  });

  it("creates a token when selecting from autocomplete", async () => {
    const user = userEvent.setup();
    render(<Default />);

    const searchInput = screen.getByPlaceholderText("Enter a category");

    // Type a category
    await user.type(searchInput, "Status");

    // Wait for the (debounced) category suggestions to load before submitting,
    // otherwise the input is classified as a keyword instead of a category
    await screen.findByRole("option", { name: "Status" });
    await user.keyboard("{Enter}");

    // Check if token is created
    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    // Check if placeholder changes for operator
    expect(
      screen.getByPlaceholderText("Enter an operator"),
    ).toBeInTheDocument();
  });

  it("shows operator suggestions after selecting category", async () => {
    const user = userEvent.setup();
    render(<Default />);

    const searchInput = screen.getByPlaceholderText("Enter a category");

    // Create a category token (Status), waiting for the (debounced)
    // suggestions so the input is recognized as a category
    await user.type(searchInput, "Status");
    await screen.findByRole("option", { name: "Status" });
    await user.keyboard("{Enter}");

    // Focus operator input
    const operatorInput =
      await screen.findByPlaceholderText("Enter an operator");
    await user.click(operatorInput);

    // Open the autocomplete popup
    await user.keyboard("{ArrowDown}");

    // Wait for the listbox to appear (ensures popup is open)
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Now expect "=" operator to be one of the suggestions
    await waitFor(() => {
      expect(screen.getByText("=")).toBeInTheDocument();
    });
  });

  it("shows token menu when clicking on existing token", async () => {
    const user = userEvent.setup();
    render(<WithPrefilledTokens />);

    // Wait for the token to render, then click it (the click must be awaited
    // outside waitFor: an un-awaited click inside waitFor can fire multiple
    // times and its effects race the assertion)
    const tokenButton = await screen.findByText("12345");
    await user.click(tokenButton);

    // Check if menu appears
    await waitFor(
      () => {
        // Assuming the menu shows options for the token
        const menu = screen.getByRole("menu", { hidden: true });
        expect(menu).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("shows delete button when tokens exist", async () => {
    render(<WithPrefilledTokens />);

    // Check if delete button is present
    await waitFor(() => {
      const deleteButton = screen.getByTestId("clear-filters-button");
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it("removes all tokens when clicking delete button", async () => {
    const user = userEvent.setup();
    render(<WithPrefilledTokens />);

    // Verify tokens exist first
    await waitFor(() => {
      expect(screen.getByText("12345")).toBeInTheDocument();
      expect(screen.getByText("Running | Completed")).toBeInTheDocument();
    });

    // Click delete button (awaited, outside waitFor)
    await user.click(screen.getByTestId("clear-filters-button"));

    // Check if tokens are removed
    await waitFor(() => {
      expect(screen.queryByText("12345")).not.toBeInTheDocument();
      expect(screen.queryByText("Running | Completed")).not.toBeInTheDocument();
    });
  });

  it("focuses search field when clicking on search bar area", async () => {
    const user = userEvent.setup();
    render(<Default />);

    // Find the search bar container
    const searchBar = screen.getByTestId("search-bar");
    const searchInput = screen.getByPlaceholderText("Enter a category");

    // Click on the search bar area
    await user.click(searchBar);

    // Check if input is focused
    expect(searchInput).toHaveFocus();
  });

  it("clears token equations when the filters prop becomes empty", async () => {
    const initialFilters: Filter[] = [
      { operator: "eq", parameter: "JobID", value: "12345" },
    ];

    function Harness() {
      const [filters, setFilters] = useState<Filter[]>(initialFilters);
      return (
        <>
          <SearchBar
            filters={filters}
            setFilters={setFilters}
            createSuggestions={noopSuggestions}
          />
          <button onClick={() => setFilters([])}>external-clear</button>
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    // The prefilled token should render once useFilterSync converts the filter.
    await waitFor(() => {
      expect(screen.getByText("12345")).toBeInTheDocument();
    });

    // External caller empties the filters prop (not via the SearchBar clear button).
    await user.click(screen.getByText("external-clear"));

    // Token equations should be cleared rather than left stale.
    await waitFor(() => {
      expect(screen.queryByText("12345")).not.toBeInTheDocument();
    });
  });
});
