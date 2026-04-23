import { useEffect, useRef } from "react";
import {
  SearchBarSuggestions,
  SearchBarTokenEquation,
  SearchBarToken,
  EquationAndTokenIndex,
} from "../../../types";
import { getPreviousEquationAndToken } from "./Utils";
import { CreateSuggestionsParams } from "./SearchBar";
import { emptySuggestions, SearchBarAction } from "./useSearchBarReducer";

/**
 * Hook that handles loading suggestions (debounced) and updating token suggestions on click.
 */
export function useSearchSuggestions({
  focusedTokenIndex,
  tokenEquations,
  clickedTokenIndex,
  inputValue,
  usesCurrentInput,
  createSuggestions,
  localDispatch,
}: {
  focusedTokenIndex: EquationAndTokenIndex | null;
  tokenEquations: SearchBarTokenEquation[];
  clickedTokenIndex: EquationAndTokenIndex | null;
  inputValue: string;
  usesCurrentInput: boolean;
  createSuggestions: (
    params: CreateSuggestionsParams,
  ) => Promise<SearchBarSuggestions>;
  localDispatch: React.Dispatch<SearchBarAction>;
}) {
  const focusedTokenIndexRef = useRef(focusedTokenIndex);
  focusedTokenIndexRef.current = focusedTokenIndex;
  const lastClickedTokenIndexRef = useRef<string | null>(null);

  const { previousEquation, previousToken } = getPreviousEquationAndToken(
    focusedTokenIndex,
    tokenEquations,
  );

  // Reset focused token when equations become empty
  useEffect(() => {
    if (
      previousEquation === undefined &&
      focusedTokenIndex !== null &&
      tokenEquations.length === 0
    ) {
      localDispatch({ type: "SET_FOCUSED_TOKEN", index: null });
      localDispatch({ type: "SET_INPUT", value: "" });
    }
  }, [
    focusedTokenIndex,
    tokenEquations.length,
    previousEquation,
    localDispatch,
  ]);

  // Load suggestions (debounced)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      localDispatch({ type: "SET_SUGGESTIONS_LOADING", loading: true });
      localDispatch({ type: "SET_SUGGESTIONS", suggestions: emptySuggestions });

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
          localDispatch({ type: "SET_SUGGESTIONS", suggestions: result });
        }
      } finally {
        if (!cancelled) {
          localDispatch({ type: "SET_SUGGESTIONS_LOADING", loading: false });
        }
      }
    };

    const debounceTimer = setTimeout(run, 150);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    previousEquation,
    previousToken,
    createSuggestions,
    focusedTokenIndex,
    tokenEquations.length,
    localDispatch,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(usesCurrentInput ? [inputValue] : []),
  ]);

  // Open suggestions menu when a token is clicked
  useEffect(() => {
    if (clickedTokenIndex !== null) {
      const { equationIndex, tokenIndex } = clickedTokenIndex;
      const tokenSuggestions =
        tokenEquations[equationIndex]?.items[tokenIndex]?.suggestions?.items ||
        [];

      if (tokenSuggestions.length > 0) {
        localDispatch({
          type: "SET_ANCHOR_EL",
          el: document.querySelector(
            `#tokenid\\:equation-${equationIndex}-token-${tokenIndex}`,
          ),
        });
      }
    }
  }, [tokenEquations, clickedTokenIndex, localDispatch]);

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

      localDispatch({ type: "SET_EQUATIONS", equations: updatedEquations });
    }
    updateSuggestions();
    lastClickedTokenIndexRef.current = JSON.stringify(clickedTokenIndex);
  }, [clickedTokenIndex, tokenEquations, createSuggestions, localDispatch]);

  return { previousEquation, previousToken } as {
    previousEquation: SearchBarTokenEquation | undefined;
    previousToken: SearchBarToken | undefined;
  };
}
