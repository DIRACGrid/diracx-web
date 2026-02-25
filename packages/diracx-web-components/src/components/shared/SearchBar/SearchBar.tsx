import React, { useState, useRef, useEffect } from "react";

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

import {
  handleEquationsVerification,
  getPreviousEquationAndToken,
  convertFilterToTokenEquation,
} from "./Utils";

import { DisplayTokenEquation } from "./DisplayTokenEquation";

import {
  convertAndApplyFilters,
  defaultClearFunction,
} from "./defaultFunctions";

import SearchField from "./SearchField";

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
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | Element>(null);
  const [clickedTokenIndex, setClickedTokenIndex] =
    useState<EquationAndTokenIndex | null>(null);
  const [focusedTokenIndex, setFocusedTokenIndex] =
    useState<EquationAndTokenIndex | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedEquationsRef = useRef<string>("[]");
  const lastClickedTokenIndexRef = useRef<string | null>(null);
  const [tokenEquations, setTokenEquations] = useState<
    SearchBarTokenEquation[]
  >([]);

  const [isSuggestionsLoading, setIsSuggestionsLoading] =
    useState<boolean>(false);

  /** A ref to store the current filters to avoid reloading the token equations */
  const currentFilters = useRef<string | null>(null);
  /** A ref to store a boolean indicating if the component is updating from search */
  const isUpdatingFromSearch = useRef<boolean>(false);

  const [suggestions, setSuggestions] = useState<SearchBarSuggestions>({
    items: [],
    nature: [],
    type: [],
  });

  const { previousEquation, previousToken } = getPreviousEquationAndToken(
    focusedTokenIndex,
    tokenEquations,
  );

  useEffect(() => {
    if (
      previousEquation === undefined &&
      focusedTokenIndex !== null &&
      tokenEquations.length === 0
    ) {
      setFocusedTokenIndex(null);
      setInputValue("");
    }
  }, [focusedTokenIndex, tokenEquations.length, previousEquation]);

  // Effect to initialize the token equations from filters
  useEffect(() => {
    const newFiltersString = String(
      filters.map((filter) => JSON.stringify(filter)),
    );

    if (isUpdatingFromSearch.current) {
      isUpdatingFromSearch.current = false; // Reset the flag after updating from search
      currentFilters.current = newFiltersString; // Update the current filters to the new filters
      return;
    }
    if (currentFilters && currentFilters.current === newFiltersString) return; // Avoid reloading if already loaded

    let cancelled = false;

    async function load() {
      const promises = filters.map(async (filter, filterIndex) =>
        convertFilterToTokenEquation(filter, filterIndex, createSuggestions),
      );
      const newTokenEquations = await Promise.all(promises);
      if (!cancelled) {
        currentFilters.current = newFiltersString;
        setTokenEquations(newTokenEquations);
      }
    }

    if (filters.length !== 0) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [filters, createSuggestions, currentFilters, tokenEquations.length]);

  // Load suggestions (with proper loading tracking and cancellation)
  useEffect(() => {
    let cancelled = false;

    const emptySuggestions: SearchBarSuggestions = {
      items: [],
      nature: [],
      type: [],
    };

    const run = async () => {
      setIsSuggestionsLoading(true);
      setSuggestions(emptySuggestions);

      try {
        const params: CreateSuggestionsParams = {
          previousToken,
          previousEquation,
          equationIndex:
            focusedTokenIndex?.equationIndex ?? tokenEquations.length - 1,
        };
        if (usesCurrentInput && inputValue) {
          params.currentInput = inputValue;
        }

        const result = await createSuggestions(params);
        if (!cancelled) {
          setSuggestions(result);
        }
      } finally {
        if (!cancelled) {
          setIsSuggestionsLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previousEquation,
    previousToken,
    createSuggestions,
    focusedTokenIndex,
    tokenEquations.length,
    // If the current input is not used, we don't want to trigger the suggestions for each letter typed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(usesCurrentInput ? [inputValue] : []),
  ]);

  // Timer to delay the search function
  // This effect will trigger the searchFonction after a delay if the equations are valid
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const allEquationsValid = tokenEquations.every(
      (eq) => eq.status === EquationStatus.VALID,
    );

    const currentEquationsString = JSON.stringify(
      tokenEquations.map((eq) => ({
        items: eq.items.map((item) => ({ label: item.label, type: item.type })),
        status: eq.status,
      })),
    );

    const hasChanged =
      currentEquationsString !== lastSearchedEquationsRef.current;

    if (allEquationsValid && hasChanged) {
      searchTimerRef.current = setTimeout(() => {
        isUpdatingFromSearch.current = true;
        lastSearchedEquationsRef.current = currentEquationsString;
        searchFunction(tokenEquations, setFilters);
      }, 800);
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [tokenEquations, searchFunction, setFilters]);

  // Always focus the input field
  useEffect(() => {
    inputRef.current?.focus();
  }, [focusedTokenIndex]);

  // Effect to open the suggestions menu when a token is clicked
  useEffect(() => {
    if (clickedTokenIndex !== null) {
      const { equationIndex, tokenIndex } = clickedTokenIndex;
      const suggestions =
        tokenEquations[equationIndex].items[tokenIndex].suggestions?.items ||
        [];

      if (suggestions.length > 0) {
        // If there are suggestions, open the menu
        setAnchorEl(
          document.querySelector(
            `#tokenid\\:equation-${equationIndex}-token-${tokenIndex}`,
          ),
        );
      }
    }
  }, [tokenEquations, clickedTokenIndex]);

  const handleOptionMenuClose = () => {
    setAnchorEl(null);
    setClickedTokenIndex(null);
  };

  const handleOptionSelect = (
    option: string,
    nature: SearchBarTokenNature,
    type: CategoryType,
  ) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (clickedTokenIndex !== null) {
      const updatedTokens = [...tokenEquations]; // Create a copy of the token equations
      const updatedToken = updatedTokens[clickedTokenIndex.equationIndex]; // The equation being edited

      updatedToken.items[clickedTokenIndex.tokenIndex] = {
        ...updatedToken.items[clickedTokenIndex.tokenIndex],
        type: type, // Change the type
        nature: nature, // Change the nature
        label: option,
      };

      updatedTokens[clickedTokenIndex.equationIndex] = updatedToken; // Update the equation in the list
      setTokenEquations(updatedTokens);
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

  // Update the suggestions of the selected token if it exists
  useEffect(() => {
    async function updateSuggestions() {
      if (
        clickedTokenIndex === null ||
        lastClickedTokenIndexRef.current === JSON.stringify(clickedTokenIndex)
      )
        return;
      const { previousEquation, previousToken } = getPreviousEquationAndToken(
        clickedTokenIndex,
        tokenEquations,
      );
      const newSuggestions = await createSuggestions({
        previousToken,
        previousEquation,
        equationIndex: clickedTokenIndex.equationIndex,
      });

      const updatedEquations = tokenEquations.map((eq, eqIdx) => {
        if (eqIdx !== clickedTokenIndex.equationIndex) return eq;
        return {
          ...eq,
          items: eq.items.map((item, itemIdx) => {
            if (itemIdx !== clickedTokenIndex.tokenIndex) return item;
            return { ...item, suggestions: newSuggestions };
          }),
        };
      });

      setTokenEquations(updatedEquations);
    }
    updateSuggestions();
    lastClickedTokenIndexRef.current = JSON.stringify(clickedTokenIndex);
  }, [clickedTokenIndex, tokenEquations, createSuggestions]);

  /**
   * The suggestions of the selected token
   */
  const currentSuggestions: SearchBarSuggestions =
    clickedTokenIndex !== null
      ? tokenEquations[clickedTokenIndex.equationIndex].items[
          clickedTokenIndex.tokenIndex
        ].suggestions || {
          items: [],
          nature: [],
          type: [],
        }
      : { items: [], nature: [], type: [] };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: 1,
        pt: 0.5,
      }}
    >
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
                setClickedTokenIndex({ equationIndex: index, tokenIndex })
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
          {/* Otherwise, the search field is at the end */}
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
                  setInputValue("");
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
