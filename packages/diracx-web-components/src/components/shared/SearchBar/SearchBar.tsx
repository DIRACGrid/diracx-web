import React, { useReducer, useRef, useEffect, useCallback } from "react";

import { Box, Menu, MenuItem, IconButton, Tooltip } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  Filter,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBarSuggestions,
  EquationAndTokenIndex,
  EquationStatus,
  SearchBarTokenNature,
  CategoryType,
} from "../../../types";

import { handleEquationsVerification } from "./Utils";

import { DisplayTokenEquation } from "./DisplayTokenEquation";

import {
  convertAndApplyFilters,
  defaultClearFunction,
} from "./defaultFunctions";

import SearchField from "./SearchField";

import {
  searchBarReducer,
  initialSearchBarState,
  emptySuggestions,
} from "./useSearchBarReducer";

import { useSearchSuggestions } from "./useSearchSuggestions";
import { useFilterSync } from "./useFilterSync";

export interface CreateSuggestionsParams {
  previousToken?: SearchBarToken;
  previousEquation?: SearchBarTokenEquation;
  currentInput?: string;
  equationIndex?: number;
}

export interface SearchBarProps {
  /** The filters to be applied to the search */
  filters: Filter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The data to be used for suggestions */
  createSuggestions: ({
    previousToken,
    previousEquation,
    currentInput,
    equationIndex,
  }: CreateSuggestionsParams) => Promise<SearchBarSuggestions>;
  /** The function to call when the search is performed (optional) */
  searchFunction?: (
    equations: SearchBarTokenEquation[],
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
  ) => void;
  /** The function to call when the search is refreshed (optional) */
  refreshFunction?: (
    equations: SearchBarTokenEquation[],
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
  ) => void;
  /** The function to call when the search is cleared (optional) */
  clearFunction?: (
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
    setTokenEquations: React.Dispatch<
      React.SetStateAction<SearchBarTokenEquation[]>
    >,
  ) => void;
  /** Whether to allow keyword search or not (default is true) */
  allowKeyWordSearch?: boolean;
  /** Whether createSuggestions uses the currentInput parameter (default is false) */
  usesCurrentInput?: boolean;
}

/**
 * The SearchBar component allows users to create and manage search filters
 * using a dynamic input field that supports token equations.
 *
 * @param props - The properties for the SearchBar component.
 * @returns The rendered SearchBar component.
 */
export function SearchBar({
  filters,
  setFilters,
  createSuggestions,
  searchFunction = convertAndApplyFilters,
  clearFunction = defaultClearFunction,
  refreshFunction = convertAndApplyFilters,
  allowKeyWordSearch = true,
  usesCurrentInput = false,
}: SearchBarProps) {
  const [state, localDispatch] = useReducer(
    searchBarReducer,
    initialSearchBarState,
  );
  const {
    inputValue,
    anchorEl,
    clickedTokenIndex,
    focusedTokenIndex,
    tokenEquations,
    isSuggestionsLoading,
    suggestions,
  } = state;

  // Refs for functional updates from child components
  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Wrapper to allow clearFunction and SearchField to use a setState-style API
  const setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  > = useCallback(
    (
      action:
        | SearchBarTokenEquation[]
        | ((prev: SearchBarTokenEquation[]) => SearchBarTokenEquation[]),
    ) => {
      if (typeof action === "function") {
        localDispatch({
          type: "SET_EQUATIONS",
          equations: [] as SearchBarTokenEquation[],
        });
      }
      localDispatch({
        type: "SET_EQUATIONS",
        equations:
          typeof action === "function" ? action(tokenEquations) : action,
      });
    },
    [tokenEquations],
  );

  const setInputValue: React.Dispatch<React.SetStateAction<string>> =
    useCallback((action: React.SetStateAction<string>) => {
      if (typeof action === "function") {
        localDispatch({
          type: "SET_INPUT",
          value: action(inputValueRef.current),
        });
      } else {
        localDispatch({ type: "SET_INPUT", value: action });
      }
    }, []);

  const setFocusedTokenIndex: React.Dispatch<
    React.SetStateAction<EquationAndTokenIndex | null>
  > = useCallback(
    (action: React.SetStateAction<EquationAndTokenIndex | null>) => {
      const focusedRef = focusedTokenIndex;
      if (typeof action === "function") {
        localDispatch({
          type: "SET_FOCUSED_TOKEN",
          index: action(focusedRef),
        });
      } else {
        localDispatch({ type: "SET_FOCUSED_TOKEN", index: action });
      }
    },
    [focusedTokenIndex],
  );

  // Use the extracted suggestions hook
  useSearchSuggestions({
    focusedTokenIndex,
    tokenEquations,
    clickedTokenIndex,
    inputValue,
    usesCurrentInput,
    createSuggestions,
    localDispatch,
  });

  // Bidirectional sync between filters prop and tokenEquations state
  const { cancelPendingSearch } = useFilterSync({
    filters,
    setFilters,
    createSuggestions,
    localDispatch,
    tokenEquations,
    searchFunction,
  });

  // Focus input when focused token changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [focusedTokenIndex]);

  const handleOptionMenuClose = () => {
    localDispatch({ type: "CLOSE_OPTION_MENU" });
  };

  const handleOptionSelect = (
    option: string,
    nature: SearchBarTokenNature,
    type: CategoryType,
  ) => {
    cancelPendingSearch();

    if (clickedTokenIndex !== null) {
      const updatedTokens = [...tokenEquations];
      const updatedToken = updatedTokens[clickedTokenIndex.equationIndex];

      updatedToken.items[clickedTokenIndex.tokenIndex] = {
        ...updatedToken.items[clickedTokenIndex.tokenIndex],
        type: type,
        nature: nature,
        label: option,
      };

      updatedTokens[clickedTokenIndex.equationIndex] = updatedToken;
      localDispatch({ type: "SET_EQUATIONS", equations: updatedTokens });
      handleEquationsVerification(updatedTokens, setTokenEquations);
    }
    handleOptionMenuClose();
  };

  const DynamicSearchField = (
    <SearchField
      key="dynamic-search-field"
      inputValue={inputValue}
      setInputValue={setInputValue}
      inputRef={inputRef}
      setTokenEquations={setTokenEquations}
      tokenEquations={tokenEquations}
      suggestions={suggestions}
      suggestionsLoading={isSuggestionsLoading}
      focusedTokenIndex={focusedTokenIndex}
      setFocusedTokenIndex={setFocusedTokenIndex}
      allowKeyWordSearch={allowKeyWordSearch}
    />
  );

  const currentSuggestions: SearchBarSuggestions =
    clickedTokenIndex !== null
      ? tokenEquations[clickedTokenIndex.equationIndex].items[
          clickedTokenIndex.tokenIndex
        ].suggestions || emptySuggestions
      : emptySuggestions;

  // Visually hidden style for screen reader announcements
  const visuallyHidden = {
    position: "absolute" as const,
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap" as const,
    border: 0,
  };

  const suggestionsCount = suggestions.items.length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: 1,
        pt: 0.5,
      }}
    >
      <span aria-live="polite" style={visuallyHidden}>
        {suggestionsCount > 0
          ? `${suggestionsCount} suggestion${suggestionsCount !== 1 ? "s" : ""} available`
          : ""}
      </span>
      {/* The search bar */}
      <Box
        onClick={() => {
          inputRef.current?.focus();
        }}
        sx={{
          width: 1,
          display: "flex",
          border: "1px solid",
          borderColor: "grey.400",
          borderRadius: 1,
          ":focus-within": {
            borderColor: "primary.main",
          },
          alignItems: "center",
        }}
        role="search"
        aria-label="Search filters"
        data-testid="search-bar"
      >
        <Box
          sx={{
            gap: 0.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            px: 0.5,
            py: 0.25,
            width: 1,
          }}
        >
          {tokenEquations.map((equation, index) => (
            <DisplayTokenEquation
              key={index}
              tokensEquation={equation}
              handleClick={(_e, tokenIndex) =>
                localDispatch({
                  type: "SET_CLICKED_TOKEN",
                  index: { equationIndex: index, tokenIndex },
                })
              }
              handleDelete={() =>
                setTokenEquations((prev) => [
                  ...prev.filter((_, i) => i !== index),
                ])
              }
              equationIndex={index}
              DynamicSearchField={DynamicSearchField}
              focusedTokenIndex={focusedTokenIndex}
            />
          ))}
          {!focusedTokenIndex && DynamicSearchField}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleOptionMenuClose}
          >
            {clickedTokenIndex !== null &&
              currentSuggestions.items.map((option, idx) => (
                <MenuItem
                  key={idx}
                  onClick={() =>
                    handleOptionSelect(
                      option,
                      currentSuggestions.nature[idx],
                      currentSuggestions.type[idx],
                    )
                  }
                >
                  {option}
                </MenuItem>
              ))}
          </Menu>
        </Box>
        <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <Tooltip title="Refresh search">
            <span>
              <IconButton
                aria-label="Refresh search"
                data-testid="refresh-search-button"
                onClick={() => refreshFunction(tokenEquations, setFilters)}
                disabled={
                  !tokenEquations.every(
                    (eq) => eq.status === EquationStatus.VALID,
                  )
                }
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          {tokenEquations.length !== 0 && (
            <Tooltip title="Clear all filters">
              <IconButton
                aria-label="Clear all filters"
                data-testid="clear-filters-button"
                onClick={() => {
                  localDispatch({ type: "CLEAR", inputValue: "" });
                  clearFunction(setFilters, setTokenEquations);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}
