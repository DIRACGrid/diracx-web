import React, { useState, useRef, useEffect } from "react";

import { Box, Menu, MenuItem, IconButton } from "@mui/material";

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
import { PlotTypeSelector } from "./PlotTypeSelector";

export interface SearchBarProps<T extends string> {
  /** The filters to be applied to the search */
  filters: Filter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The data to be used for suggestions */
  createSuggestions: (
    previousToken: SearchBarToken | undefined,
    previousEquation: SearchBarTokenEquation | undefined,
    equationIndex?: number,
  ) => Promise<SearchBarSuggestions>;
  /** The function to call when the search is performed (optional) */
  searchFunction?: (
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
  plotTypeSelectorProps?: {
    plotType: T;
    setPlotType: React.Dispatch<React.SetStateAction<T>>;
    buttonList?: { plotName: T; icon: React.ReactNode }[];
  };
}

/**
 * The SearchBar component allows users to create and manage search filters
 * using a dynamic input field that supports token equations.
 *
 * @param props - The properties for the SearchBar component.
 * @returns The rendered SearchBar component.
 */
export function SearchBar<T extends string>({
  filters,
  setFilters,
  createSuggestions,
  searchFunction = convertAndApplyFilters,
  clearFunction = defaultClearFunction,
  allowKeyWordSearch = true,
  plotTypeSelectorProps,
}: SearchBarProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [clickedTokenIndex, setClickedTokenIndex] =
    useState<EquationAndTokenIndex | null>(null);
  const [focusedTokenIndex, setFocusedTokenIndex] =
    useState<EquationAndTokenIndex | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedEquationsRef = useRef<string>("[]");
  const lastClickedTokenIndexRef = useRef<string | null>(null);
  const [tokenEquations, setTokenEquations] = useState<
    SearchBarTokenEquation[]
  >([]);
  /** A ref to store the current filters to avoid reloading the token equations */
  const currentFilters = useRef<string | null>(null);
  /** A ref to store a boolean indicating if the component is updating from search */
  const isUpdatingFromSearch = useRef<boolean>(false);

  const [suggestions, setSuggestions] = useState<SearchBarSuggestions>({
    items: [],
    nature: [],
    type: [],
    hideSuggestion: [],
  });

  const { previousEquation, previousToken } = getPreviousEquationAndToken(
    focusedTokenIndex,
    tokenEquations,
  );

  if (
    previousEquation === undefined &&
    focusedTokenIndex !== null &&
    tokenEquations.length === 0
  ) {
    setFocusedTokenIndex(null);
    setInputValue("");
  }

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

    async function load() {
      const promises = filters.map(async (filter, filterIndex) =>
        convertFilterToTokenEquation(filter, filterIndex, createSuggestions),
      );
      const newTokenEquations = await Promise.all(promises);
      setTokenEquations(newTokenEquations);
    }

    if (filters.length !== 0) {
      load();
      currentFilters.current = newFiltersString;
    }
  }, [filters, createSuggestions, currentFilters, tokenEquations.length]);

  // Create a list of options based on the current tokens and data
  useEffect(() => {
    async function load() {
      const result = await createSuggestions(
        previousToken,
        previousEquation,
        focusedTokenIndex?.equationIndex,
      );
      setSuggestions(result);
    }
    load();
  }, [previousEquation, previousToken, createSuggestions, focusedTokenIndex]);

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

  const handleOptionMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    equationIndex: number,
    tokenIndex: number,
  ) => {
    if (
      (tokenEquations[equationIndex].items[tokenIndex].suggestions?.items || [])
        .length > 0
    ) {
      setAnchorEl(event.currentTarget);
      setClickedTokenIndex({ equationIndex, tokenIndex });
    }
  };

  const handleOptionMenuClose = () => {
    setAnchorEl(null);
    setClickedTokenIndex(null);
  };

  const handleOptionSelect = (
    option: string,
    nature: SearchBarTokenNature,
    type: CategoryType,
    hideSuggestion: boolean,
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
        hideSuggestion,
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
      tokenEquations[clickedTokenIndex.equationIndex].items[
        clickedTokenIndex.tokenIndex
      ].suggestions = await createSuggestions(
        previousToken,
        previousEquation,
        clickedTokenIndex.equationIndex,
      );

      setTokenEquations([...tokenEquations]); // Update the state to trigger a re-render
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
          hideSuggestion: [],
        }
      : { items: [], nature: [], type: [], hideSuggestion: [] };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: 1,
      }}
    >
      {/* The search bar */}
      <Box
        onClick={() => {
          inputRef.current?.focus();
        }}
        sx={{
          width: 1,
          height: "auto",
          display: "flex",
          border: "1px solid",
          borderColor: "grey.400",
          overflow: "hidden",
          borderRadius: 1,
          ":focus-within": {
            borderColor: "primary.main",
          },
          alignItems: "center",
        }}
        data-testid="search-bar"
      >
        <Box sx={{ gap: 1, display: "flex", padding: 1, overflow: "auto" }}>
          {tokenEquations.map((equation, index) => (
            <DisplayTokenEquation
              key={index}
              tokensEquation={equation}
              handleClick={(e, tokenIndex) =>
                handleOptionMenuOpen(e, index, tokenIndex)
              }
              handleRightClick={() =>
                setTokenEquations((prev) => [
                  ...prev.filter((_, i) => i !== index),
                ])
              } // Remove the equation on right click
              equationIndex={index}
              DynamicSearchField={DynamicSearchField} // The dynamic search field can be in the middle of the equations
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
                      currentSuggestions.hideSuggestion[idx],
                    )
                  }
                >
                  {option}
                </MenuItem>
              ))}
          </Menu>
        </Box>
        <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => searchFunction(tokenEquations, setFilters)}
            disabled={
              !tokenEquations.every((eq) => eq.status === EquationStatus.VALID)
            }
            sx={{ width: "40px", height: "40px" }}
          >
            <RefreshIcon />
          </IconButton>

          {tokenEquations.length !== 0 && (
            <IconButton
              onClick={() => {
                setInputValue("");
                clearFunction(setFilters, setTokenEquations);
              }}
              sx={{ width: "40px", height: "40px" }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      {/* Plot type selector if provided */}
      {plotTypeSelectorProps && (
        <PlotTypeSelector
          plotType={plotTypeSelectorProps.plotType}
          setPlotType={plotTypeSelectorProps.setPlotType}
          buttonList={plotTypeSelectorProps.buttonList}
        />
      )}
    </Box>
  );
}
