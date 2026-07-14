import {
  searchBarReducer,
  initialSearchBarState,
  emptySuggestions,
  SearchBarAction,
  SearchBarState,
} from "../src/components/shared/SearchBar/useSearchBarReducer";
import {
  CategoryType,
  EquationStatus,
  SearchBarTokenNature,
  SearchBarSuggestions,
  SearchBarTokenEquation,
} from "../src/types";

const sampleEquation: SearchBarTokenEquation = {
  id: "eq-1",
  status: EquationStatus.VALID,
  items: [
    {
      label: "Status",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.CATEGORY,
    },
    {
      label: "=",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.OPERATOR,
    },
    {
      label: "Running",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.VALUE,
    },
  ],
};

const sampleSuggestions: SearchBarSuggestions = {
  items: ["Status", "Site"],
  nature: [SearchBarTokenNature.CATEGORY, SearchBarTokenNature.CATEGORY],
  type: [CategoryType.STRING, CategoryType.STRING],
};

describe("searchBarReducer", () => {
  it("SET_INPUT updates inputValue only", () => {
    const next = searchBarReducer(initialSearchBarState, {
      type: "SET_INPUT",
      value: "Sta",
    });
    expect(next.inputValue).toBe("Sta");
    expect(next).toEqual({ ...initialSearchBarState, inputValue: "Sta" });
    // The reducer must not mutate the previous state
    expect(initialSearchBarState.inputValue).toBe("");
  });

  it("SET_SUGGESTIONS replaces the suggestions", () => {
    const next = searchBarReducer(initialSearchBarState, {
      type: "SET_SUGGESTIONS",
      suggestions: sampleSuggestions,
    });
    expect(next.suggestions).toBe(sampleSuggestions);
    expect(next.tokenEquations).toBe(initialSearchBarState.tokenEquations);
  });

  it("SET_SUGGESTIONS_LOADING toggles the loading flag", () => {
    const loading = searchBarReducer(initialSearchBarState, {
      type: "SET_SUGGESTIONS_LOADING",
      loading: true,
    });
    expect(loading.isSuggestionsLoading).toBe(true);

    const done = searchBarReducer(loading, {
      type: "SET_SUGGESTIONS_LOADING",
      loading: false,
    });
    expect(done.isSuggestionsLoading).toBe(false);
  });

  it("SET_EQUATIONS replaces the token equations", () => {
    const next = searchBarReducer(initialSearchBarState, {
      type: "SET_EQUATIONS",
      equations: [sampleEquation],
    });
    expect(next.tokenEquations).toEqual([sampleEquation]);
  });

  it("SET_EQUATIONS with an empty array clears the equations", () => {
    const withEquations = searchBarReducer(initialSearchBarState, {
      type: "SET_EQUATIONS",
      equations: [sampleEquation],
    });
    const cleared = searchBarReducer(withEquations, {
      type: "SET_EQUATIONS",
      equations: [],
    });
    expect(cleared.tokenEquations).toEqual([]);
  });

  it("UPDATE_EQUATIONS applies the updater to the current equations", () => {
    const withEquations = searchBarReducer(initialSearchBarState, {
      type: "SET_EQUATIONS",
      equations: [sampleEquation],
    });

    const updater = jest.fn((prev: SearchBarTokenEquation[]) =>
      prev.map((eq) => ({ ...eq, status: EquationStatus.INVALID })),
    );
    const next = searchBarReducer(withEquations, {
      type: "UPDATE_EQUATIONS",
      updater,
    });

    // The updater must receive the equations from the state being reduced
    expect(updater).toHaveBeenCalledTimes(1);
    expect(updater).toHaveBeenCalledWith(withEquations.tokenEquations);
    expect(next.tokenEquations).toHaveLength(1);
    expect(next.tokenEquations[0].status).toBe(EquationStatus.INVALID);
    // Previous state untouched
    expect(withEquations.tokenEquations[0].status).toBe(EquationStatus.VALID);
  });

  it("UPDATE_EQUATIONS can remove all equations", () => {
    const withEquations = searchBarReducer(initialSearchBarState, {
      type: "SET_EQUATIONS",
      equations: [sampleEquation],
    });
    const next = searchBarReducer(withEquations, {
      type: "UPDATE_EQUATIONS",
      updater: () => [],
    });
    expect(next.tokenEquations).toEqual([]);
  });

  it("SET_FOCUSED_TOKEN sets and clears the focused token index", () => {
    const focused = searchBarReducer(initialSearchBarState, {
      type: "SET_FOCUSED_TOKEN",
      index: { equationIndex: 0, tokenIndex: 2 },
    });
    expect(focused.focusedTokenIndex).toEqual({
      equationIndex: 0,
      tokenIndex: 2,
    });

    const blurred = searchBarReducer(focused, {
      type: "SET_FOCUSED_TOKEN",
      index: null,
    });
    expect(blurred.focusedTokenIndex).toBeNull();
  });

  it("SET_CLICKED_TOKEN sets and clears the clicked token index", () => {
    const clicked = searchBarReducer(initialSearchBarState, {
      type: "SET_CLICKED_TOKEN",
      index: { equationIndex: 1, tokenIndex: 0 },
    });
    expect(clicked.clickedTokenIndex).toEqual({
      equationIndex: 1,
      tokenIndex: 0,
    });

    const cleared = searchBarReducer(clicked, {
      type: "SET_CLICKED_TOKEN",
      index: null,
    });
    expect(cleared.clickedTokenIndex).toBeNull();
  });

  it("SET_ANCHOR_EL stores the anchor element", () => {
    const el = document.createElement("div");
    const next = searchBarReducer(initialSearchBarState, {
      type: "SET_ANCHOR_EL",
      el,
    });
    expect(next.anchorEl).toBe(el);
  });

  it("CLOSE_OPTION_MENU clears both anchorEl and clickedTokenIndex", () => {
    const open: SearchBarState = {
      ...initialSearchBarState,
      anchorEl: document.createElement("div"),
      clickedTokenIndex: { equationIndex: 0, tokenIndex: 1 },
    };
    const next = searchBarReducer(open, { type: "CLOSE_OPTION_MENU" });
    expect(next.anchorEl).toBeNull();
    expect(next.clickedTokenIndex).toBeNull();
  });

  it("CLEAR resets the input and suggestions but keeps the equations", () => {
    const populated: SearchBarState = {
      ...initialSearchBarState,
      inputValue: "Runn",
      suggestions: sampleSuggestions,
      tokenEquations: [sampleEquation],
    };
    const next = searchBarReducer(populated, {
      type: "CLEAR",
      inputValue: "",
    });
    expect(next.inputValue).toBe("");
    expect(next.suggestions).toBe(emptySuggestions);
    // CLEAR only resets input/suggestions; equations are cleared separately
    // by the caller (clearFunction)
    expect(next.tokenEquations).toBe(populated.tokenEquations);
  });

  it("returns the same state reference for unknown actions", () => {
    const state: SearchBarState = {
      ...initialSearchBarState,
      tokenEquations: [sampleEquation],
    };
    const next = searchBarReducer(state, {
      type: "NOT_A_REAL_ACTION",
    } as unknown as SearchBarAction);
    // Referential stability: React can bail out of re-rendering
    expect(next).toBe(state);
  });
});
