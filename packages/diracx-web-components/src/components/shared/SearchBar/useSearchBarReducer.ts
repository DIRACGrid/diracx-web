import {
  SearchBarTokenEquation,
  SearchBarSuggestions,
  EquationAndTokenIndex,
} from "../../../types";

export const emptySuggestions: SearchBarSuggestions = {
  items: [],
  nature: [],
  type: [],
};

export interface SearchBarState {
  inputValue: string;
  anchorEl: Element | null;
  clickedTokenIndex: EquationAndTokenIndex | null;
  focusedTokenIndex: EquationAndTokenIndex | null;
  tokenEquations: SearchBarTokenEquation[];
  isSuggestionsLoading: boolean;
  suggestions: SearchBarSuggestions;
}

export type SearchBarAction =
  | { type: "SET_INPUT"; value: string }
  | { type: "SET_SUGGESTIONS"; suggestions: SearchBarSuggestions }
  | { type: "SET_SUGGESTIONS_LOADING"; loading: boolean }
  | { type: "SET_EQUATIONS"; equations: SearchBarTokenEquation[] }
  | { type: "SET_FOCUSED_TOKEN"; index: EquationAndTokenIndex | null }
  | { type: "SET_CLICKED_TOKEN"; index: EquationAndTokenIndex | null }
  | { type: "SET_ANCHOR_EL"; el: Element | null }
  | { type: "CLOSE_OPTION_MENU" }
  | { type: "CLEAR"; inputValue: string };

export function searchBarReducer(
  state: SearchBarState,
  action: SearchBarAction,
): SearchBarState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, inputValue: action.value };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.suggestions };
    case "SET_SUGGESTIONS_LOADING":
      return { ...state, isSuggestionsLoading: action.loading };
    case "SET_EQUATIONS":
      return { ...state, tokenEquations: action.equations };
    case "SET_FOCUSED_TOKEN":
      return { ...state, focusedTokenIndex: action.index };
    case "SET_CLICKED_TOKEN":
      return { ...state, clickedTokenIndex: action.index };
    case "SET_ANCHOR_EL":
      return { ...state, anchorEl: action.el };
    case "CLOSE_OPTION_MENU":
      return { ...state, anchorEl: null, clickedTokenIndex: null };
    case "CLEAR":
      return {
        ...state,
        inputValue: action.inputValue,
        suggestions: emptySuggestions,
      };
    default:
      return state;
  }
}

export const initialSearchBarState: SearchBarState = {
  inputValue: "",
  anchorEl: null,
  clickedTokenIndex: null,
  focusedTokenIndex: null,
  tokenEquations: [],
  isSuggestionsLoading: false,
  suggestions: emptySuggestions,
};
