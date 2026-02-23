import { useMemo, useRef } from "react";

import {
  Autocomplete,
  IconButton,
  InputAdornment,
  InputBase,
  Tooltip,
} from "@mui/material";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

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

import { MyDateTimePicker } from "./DatePicker";

/** Merge multiple React refs into a single callback ref. */
function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.RefObject<T | null>).current = node;
      }
    }
  };
}

interface SearchFieldProps {
  /** The current input value in the search field */
  inputValue: string;
  /** Function to update the input value */
  setInputValue: React.Dispatch<React.SetStateAction<string>>;

  /** Reference to the input element */
  inputRef: React.RefObject<HTMLInputElement | null>;

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
  const placeholder = useMemo(
    () =>
      previousToken
        ? previousToken.nature === SearchBarTokenNature.OPERATOR
          ? "Enter a value"
          : previousToken.nature === SearchBarTokenNature.CATEGORY
            ? "Enter an operator"
            : "Enter a category"
        : "Enter a category",
    [previousToken],
  );

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
        const updatedEquation = {
          ...previousEquation,
          items: [
            ...previousEquation.items,
            {
              label: formatedLabel,
              type: type,
              nature: nature,
              suggestions: suggestions,
            },
          ],
        };
        handleEquationsVerification(
          tokenEquations.map((eq) =>
            eq === previousEquation ? updatedEquation : eq,
          ),
          setTokenEquations,
        );
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
      const lastEquation = tokenEquations[tokenEquations.length - 1];
      let updatedTokens: SearchBarTokenEquation[];
      if (lastEquation.items.length > 1) {
        updatedTokens = [
          ...tokenEquations.slice(0, -1),
          { ...lastEquation, items: lastEquation.items.slice(0, -1) },
        ];
      } else {
        updatedTokens = tokenEquations.slice(0, -1);
      }
      handleEquationsVerification(updatedTokens, setTokenEquations);
      setFocusedTokenIndex(null);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  /** Submit the current input value as a new token. */
  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (trimmed) {
      const { nature, type } = getTokenMetadata(
        trimmed,
        suggestions,
        previousToken,
      );
      handleTokenCreation(trimmed, nature, type);
    }
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
        minWidth: "120px",
        flexGrow: 1,
      }}
      loading={suggestionsLoading}
      disableClearable={true}
      options={suggestions.items}
      value={inputValue}
      onHighlightChange={(_e, option) => {
        optionSelectedRef.current = option !== null;
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
          if (optionSelectedRef.current) {
            optionSelectedRef.current = false;
            return;
          }
          handleSubmit();
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
      renderInput={(params) => {
        // Separate the wrapper ref (used by Autocomplete for popup positioning)
        // from the rest of InputProps (className, adornments, event handlers).
        const { ref: wrapperRef, ...restWrapperProps } = params.InputProps;
        // Separate the input element ref (used by Autocomplete for focus tracking)
        // from the rest of inputProps (id, aria-*, etc.).
        const { ref: inputElRef, ...restInputProps } = params.inputProps;

        return (
          <InputBase
            ref={wrapperRef}
            {...restWrapperProps}
            id={params.id}
            disabled={params.disabled}
            fullWidth={params.fullWidth}
            placeholder={placeholder}
            data-testid="search-field"
            inputRef={mergeRefs(inputElRef, inputRef)}
            endAdornment={
              inputValue.trim() ? (
                <InputAdornment position="end">
                  <Tooltip title="Enter">
                    <IconButton
                      size="small"
                      aria-label="confirm input"
                      onMouseDown={(e) => {
                        // Prevent the input from losing focus
                        e.preventDefault();
                      }}
                      onClick={handleSubmit}
                    >
                      <KeyboardReturnIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null
            }
            inputProps={{
              ...restInputProps,
              style: {
                width: `min(max(${inputValue.length}ch + 50px, 150px), 800px)`,
              },
            }}
          />
        );
      }}
      onChange={(_e, value: string | null) => {
        if (value && value !== "") {
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
