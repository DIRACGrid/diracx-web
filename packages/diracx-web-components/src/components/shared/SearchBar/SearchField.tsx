import { useState, useRef, useEffect } from "react";

import { Autocomplete, TextField } from "@mui/material";

import {
  SearchBarTokenEquation,
  SearchBarSuggestions,
  EquationAndTokenIndex,
  CategoryType,
  SearchBarTokenNature,
  EquationStatus,
  Operators,
} from "../../../types";

import {
  getPreviousEquationAndToken,
  handleEquationsVerification,
  getTokenMetadata,
  convertListToString,
} from "./Utils";

import "dayjs/locale/en-gb"; // Import the locale for dayjs

import { MyDateTimePicker } from "./DatePicker";

interface SearchFieldProps {
  /** The current input value in the search field */
  inputValue: string;
  /** Function to update the input value */
  setInputValue: React.Dispatch<React.SetStateAction<string>>;

  /** Reference to the input element */
  inputRef: React.RefObject<HTMLInputElement>;

  /** The current token equations */
  tokenEquations: SearchBarTokenEquation[];
  /** Function to update the token equations */
  setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  >;

  /** The current suggestions for the search field */
  suggestions: SearchBarSuggestions;
  /** Boolean indicating if suggestions are loading */
  suggestionsLoading: boolean;

  /** The current focused token index */
  focusedTokenIndex: EquationAndTokenIndex | null;
  /** Function to update the focused token index */
  setFocusedTokenIndex: React.Dispatch<
    React.SetStateAction<EquationAndTokenIndex | null>
  >;

  /** Boolean indicating if keyword search is allowed */
  allowKeyWordSearch?: boolean;
}

export default function SearchField({
  inputValue,
  setInputValue,
  inputRef,
  setTokenEquations,
  tokenEquations,
  suggestions,
  suggestionsLoading,
  focusedTokenIndex,
  setFocusedTokenIndex,
  allowKeyWordSearch = true,
}: SearchFieldProps) {
  const optionSelectedRef = useRef(false);
  const { previousEquation, previousToken } = getPreviousEquationAndToken(
    focusedTokenIndex,
    tokenEquations,
  );
  const [placeholder, setPlaceholder] = useState<string>("");

  useEffect(() => {
    setPlaceholder(
      previousToken
        ? previousToken.nature === SearchBarTokenNature.OPERATOR
          ? "Enter a value"
          : previousToken.nature === SearchBarTokenNature.CATEGORY
            ? "Enter an operator"
            : "Enter a category"
        : "Enter a category",
    );
  }, [previousToken]);

  /**
   * Create a new token based on the input value and type.
   * @param label The label for the new token.
   * @param nature The nature of the token (e.g., "category", "custom", "operator", "value", ...).
   * @param type The type of the token (e.g., "string", "custom", "number", "bool", ...).
   */
  function handleTokenCreation(
    label: string,
    nature: SearchBarTokenNature,
    type: CategoryType,
  ) {
    if (!allowKeyWordSearch && nature === SearchBarTokenNature.CUSTOM) return;

    const formatedLabel = /\||,/.test(label)
      ? label.split(/,|\|/).map((item) => item.trim())
      : label.trim();

    if (focusedTokenIndex) {
      // If a token is focused, update the focused token
      const updatedTokens = [...tokenEquations];
      const equationIndex = focusedTokenIndex.equationIndex;
      const tokenIndex = focusedTokenIndex.tokenIndex;

      if (updatedTokens[equationIndex]) {
        updatedTokens[equationIndex].items[tokenIndex] = {
          label: formatedLabel,
          type: type,
          nature: nature,
          suggestions:
            nature === SearchBarTokenNature.CATEGORY ? undefined : suggestions,
        };
        handleEquationsVerification(updatedTokens, setTokenEquations);
      }
      setFocusedTokenIndex(null);
    } else {
      // If no token is focused, create a new token
      if (
        previousEquation &&
        previousEquation.status === EquationStatus.WAITING
      ) {
        previousEquation.items.push({
          label: formatedLabel,
          type: type,
          nature: nature,
          suggestions: suggestions,
        });
        handleEquationsVerification([...tokenEquations], setTokenEquations);
      } else {
        // We are creating a new equation
        const newLastEquation: SearchBarTokenEquation = {
          status:
            nature === SearchBarTokenNature.CUSTOM
              ? EquationStatus.VALID
              : EquationStatus.WAITING,
          items: [
            {
              label: formatedLabel,
              type: type,
              nature: nature,
              suggestions: undefined,
            },
          ],
        };
        handleEquationsVerification(
          [...tokenEquations, newLastEquation],
          setTokenEquations,
        );
      }
    }
    setInputValue("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function handleArrowKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const input = inputRef.current;

    if (!input) return;

    const isDatePicker =
      previousToken?.type === CategoryType.DATE &&
      previousToken?.nature === SearchBarTokenNature.OPERATOR &&
      previousToken.label !== Operators.LAST.getDisplay();

    const isAtLeftEdge = input.selectionStart === 0;
    const isAtRightEdge = isDatePicker
      ? input.selectionEnd === 19 // Assuming that the date picker input has a fixed width of 19 characters
      : input.selectionEnd === inputValue.length;

    let newFocusedTokenIndex: EquationAndTokenIndex | null = null;

    if (e.key === "ArrowLeft" && isAtLeftEdge && tokenEquations.length > 0) {
      e.preventDefault();
      if (focusedTokenIndex === null) {
        // If no token is focused, focus the last token
        newFocusedTokenIndex = {
          equationIndex: tokenEquations.length - 1,
          tokenIndex:
            tokenEquations[tokenEquations.length - 1].items.length - 1,
        };
      } else if (focusedTokenIndex !== null) {
        // If a token is focused, move the focus to the left
        const { equationIndex, tokenIndex } = focusedTokenIndex;
        if (tokenIndex > 0) {
          newFocusedTokenIndex = {
            equationIndex: equationIndex,
            tokenIndex: tokenIndex - 1,
          };
        } else if (equationIndex > 0) {
          newFocusedTokenIndex = {
            equationIndex: equationIndex - 1,
            tokenIndex: tokenEquations[equationIndex - 1].items.length - 1,
          };
        }
      }
    }

    if (
      e.key === "ArrowRight" &&
      isAtRightEdge &&
      focusedTokenIndex !== null &&
      tokenEquations.length > 0
    ) {
      const { equationIndex, tokenIndex } = focusedTokenIndex;
      if (tokenIndex < tokenEquations[equationIndex].items.length - 1) {
        // If there are more tokens in the current equation, move the focus to the right
        newFocusedTokenIndex = {
          equationIndex: equationIndex,
          tokenIndex: tokenIndex + 1,
        };
      } else if (equationIndex < tokenEquations.length - 1) {
        // If there are more equations, move to the first token of the next equation
        newFocusedTokenIndex = {
          equationIndex: equationIndex + 1,
          tokenIndex: 0,
        };
      } else {
        setFocusedTokenIndex(null);
        setInputValue("");
      }
    }

    if (newFocusedTokenIndex) {
      setInputValue(
        convertListToString(
          tokenEquations[newFocusedTokenIndex.equationIndex].items[
            newFocusedTokenIndex.tokenIndex
          ].label,
        ),
      );

      setFocusedTokenIndex(newFocusedTokenIndex);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function handleBackspaceKeyDown() {
    if (inputValue === "" && tokenEquations.length > 0) {
      const updatedTokens = [...tokenEquations];
      const lastEquation = updatedTokens[updatedTokens.length - 1];
      if (lastEquation.items.length > 1) {
        lastEquation.items = lastEquation.items.slice(0, -1);
      } else {
        updatedTokens.pop();
      }
      handleEquationsVerification(updatedTokens, setTokenEquations);
      setFocusedTokenIndex(null);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  const handleDateAccepted = (newValue: string | null) => {
    if (newValue) {
      handleTokenCreation(
        newValue,
        SearchBarTokenNature.VALUE,
        CategoryType.DATE,
      );
    }
  };

  if (
    previousToken?.nature === SearchBarTokenNature.OPERATOR &&
    previousToken?.type === CategoryType.DATE &&
    previousToken.label !== Operators.LAST.getDisplay()
  ) {
    return (
      <MyDateTimePicker
        value={inputValue || null}
        onDateAccepted={handleDateAccepted}
        handleArrowKeyDown={handleArrowKeyDown}
        handleBackspaceKeyDown={handleBackspaceKeyDown}
        inputRef={inputRef}
      />
    );
  }

  return (
    <Autocomplete
      freeSolo
      inputValue={inputValue}
      onInputChange={(_e, value) => {
        setInputValue(value);
      }}
      sx={{
        marginTop: "2px",
        minWidth: "180px",
        flexGrow: 1,
      }}
      disableClearable={true}
      options={suggestions.items}
      value={inputValue}
      onHighlightChange={(_e, option) => {
        optionSelectedRef.current = option !== null;
      }}
      loading={suggestionsLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          data-testid="search-field"
          variant="standard"
          placeholder={placeholder}
          inputRef={inputRef}
          slotProps={{
            input: {
              ...params.InputProps,
              disableUnderline: true,
            },
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" && inputValue && inputValue.trim()) {
              if (optionSelectedRef.current) {
                optionSelectedRef.current = false;
                return;
              }
              const { nature, type } = getTokenMetadata(
                inputValue.trim(),
                suggestions,
                previousToken,
              );
              // Always create token on Enter press, regardless of operator type
              handleTokenCreation(inputValue.trim(), nature, type);
            }
            if (e.key === "Backspace") {
              handleBackspaceKeyDown();
            }

            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              handleArrowKeyDown(e);
            }

            if (e.key === "Tab") {
              e.preventDefault();
              setInputValue((prev) => {
                const options = suggestions.items.filter((val) => {
                  return val.toLowerCase().startsWith(prev.toLowerCase());
                });
                return options[0] || prev;
              });
            }
            if (e.key === "Escape") {
              setFocusedTokenIndex(null);
              setInputValue("");
            }
          }}
        />
      )}
      onChange={(_e, value: string | null) => {
        if (value && value !== "") {
          optionSelectedRef.current = true;

          // Check if previous token is "in" or "not in" operator
          if (
            previousToken &&
            (previousToken.label === Operators.IN.getDisplay() ||
              previousToken.label === Operators.NOT_IN.getDisplay())
          ) {
            // For "in" and "not in" operators, accumulate values with " | " separator
            // Don't create token immediately - wait for Enter press
            if (inputValue && inputValue.trim() === "") {
              setInputValue(value);
            } else {
              // Additional value selection - append with separator
              setInputValue((prev) => {
                return inputRef.current?.value + " | " + prev;
              });
            }
            return;
          }

          // For all other operators, create token immediately
          const { nature, type } = getTokenMetadata(
            value.trim(),
            suggestions,
            previousToken,
          );
          handleTokenCreation(value, nature, type);
        }
      }}
    />
  );
}
