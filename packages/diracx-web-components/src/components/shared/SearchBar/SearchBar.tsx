import React, { useState, useRef, useEffect } from "react";

import { Box, Menu, MenuItem, IconButton } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import {
  InternalFilter,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBarSuggestions,
} from "../../../types";

import type { EquationAndTokenIndex } from "./Types";

import {
  handleEquationsVerification,
  getPreviousEquationAndToken,
  DisplayTokenEquation,
  convertFilterToTokenEquation,
} from "./Utils";

import {
  convertAndApplyFilters,
  defaultClearFonction,
} from "./defaultFunctions";

import SearchField from "./SearchField";

export interface SearchBarProps {
  // The filters to be applied to the search
  filters: InternalFilter[];
  // The function to set the filters
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  // The data to be used for suggestions
  createSuggestions: (
    previousToken: SearchBarToken | undefined,
    previousEquation: SearchBarTokenEquation | undefined,
  ) => Promise<SearchBarSuggestions>;
  // The function to call when the search is performed (optional)
  searchFunction?: (
    equations: SearchBarTokenEquation[],
    setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>,
  ) => void;
  // The function to call when the search is cleared (optional)
  clearFunction?: (
    setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>,
    setTokenEquations: React.Dispatch<
      React.SetStateAction<SearchBarTokenEquation[]>
    >,
  ) => void;
  // Whether to allow keyword search or not (default is true)
  allowKeyWordSearch?: boolean;
}

export function SearchBar({
  filters,
  setFilters,
  createSuggestions,
  searchFunction = convertAndApplyFilters,
  clearFunction = defaultClearFonction,
  allowKeyWordSearch = true,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [clickedTokenIndex, setClickedTokenIndex] = useState<{
    equationIndex: number;
    tokenIndex: number;
  } | null>(null);
  const [focusedTokenIndex, setFocusedTokenIndex] =
    useState<EquationAndTokenIndex | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchedEquationsRef = useRef<string>("");

  const [tokenEquations, setTokenEquations] = useState<
    SearchBarTokenEquation[]
  >([]);

  const [suggestions, setSuggestions] = useState<SearchBarSuggestions>({
    items: [],
    type: [],
  });

  const { previousEquation, previousToken } = getPreviousEquationAndToken(
    focusedTokenIndex,
    tokenEquations,
  );
  useEffect(() => {
    if (tokenEquations.length !== 0) return; // Avoid reloading if already loaded

    async function load() {
      const promises = filters.map(async (filter) =>
        convertFilterToTokenEquation(filter, createSuggestions),
      );
      const newTokenEquations = await Promise.all(promises);
      setTokenEquations(newTokenEquations);
    }

    if (filters.length !== 0 && tokenEquations.length === 0) load();
  }, [filters, createSuggestions]);

  // Create a list of options based on the current tokens and data
  useEffect(() => {
    async function load() {
      const result = await createSuggestions(previousToken, previousEquation);
      setSuggestions(result);
    }
    load();
  }, [previousEquation, previousToken, createSuggestions]);

  // Timer to delay the search function
  // This effect will trigger the searchFonction after a delay if the equations are valid
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const allEquationsValid = tokenEquations.every(
      (eq) => eq.status === "valid",
    );

    const currentEquationsString = JSON.stringify(
      tokenEquations.map((eq) => ({
        items: eq.items.map((item) => ({ label: item.label, type: item.type })),
        status: eq.status,
      })),
    );

    const hasChanged =
      currentEquationsString !== lastSearchedEquationsRef.current;

    if (allEquationsValid && searchFunction && hasChanged) {
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

  const handleOptionSelect = (option: string, type: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (clickedTokenIndex !== null) {
      const updatedTokens = [...tokenEquations]; // Create a copy of the token equations
      const updatedToken = updatedTokens[clickedTokenIndex.equationIndex]; // The equation being edited

      updatedToken.items[clickedTokenIndex.tokenIndex] = {
        ...updatedToken.items[clickedTokenIndex.tokenIndex],
        type: type, // Change the type
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
      focusedTokenIndex={focusedTokenIndex}
      setFocusedTokenIndex={setFocusedTokenIndex}
      allowKeyWordSearch={allowKeyWordSearch}
    />
  );

  /**
   * The suggestions of the cliqued token.
   */
  const currentSuggestions =
    clickedTokenIndex !== null
      ? tokenEquations[clickedTokenIndex.equationIndex].items[
          clickedTokenIndex.tokenIndex
        ].suggestions || { items: [], type: [] }
      : { items: [], type: [] };

  return (
    <Box
      onClick={() => inputRef.current?.focus()}
      sx={{
        width: 1,
        display: "flex",
        border: "1px solid",
        borderColor: "grey.400",
        overflow: "auto",
        borderRadius: 1,
        ":focus-within": {
          borderColor: "primary.main",
        },
      }}
      data-testid="search-bar"
    >
      <Box sx={{ gap: 1, display: "flex", padding: 1, width: 0.9 }}>
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
        {!focusedTokenIndex && DynamicSearchField}{" "}
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
                  handleOptionSelect(option, currentSuggestions.type[idx])
                }
              >
                {option}
              </MenuItem>
            ))}
        </Menu>
      </Box>
      {tokenEquations.length !== 0 && (
        <IconButton
          onClick={() => {
            clearFunction(setFilters, setTokenEquations);
          }}
          disabled={tokenEquations.length === 0}
          sx={{ marginLeft: "auto", width: "40px", height: "40px" }}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  );
}
