import { useEffect, useRef } from "react";

import {
  Filter,
  SearchBarTokenEquation,
  SearchBarSuggestions,
  EquationStatus,
} from "../../../types";

import { convertFilterToTokenEquation } from "./Utils";
import type { SearchBarAction } from "./useSearchBarReducer";
import type { CreateSuggestionsParams } from "./SearchBar";

/**
 * Manages bidirectional synchronization between external `filters` prop
 * and internal `tokenEquations` state.
 *
 * - **Inbound**: when `filters` changes externally (e.g. pie chart click),
 *   converts filters to token equations.
 * - **Outbound**: when all token equations become valid (user finishes typing),
 *   debounces and calls `searchFunction` which updates filters.
 *
 * Three refs break the circular dependency: outbound sets a flag so inbound
 * skips the next update that it caused itself.
 *
 * Returns `cancelPendingSearch` so callers (e.g. option-select handler)
 * can cancel the debounced search before applying their own change.
 */
export function useFilterSync({
  filters,
  setFilters,
  createSuggestions,
  localDispatch,
  tokenEquations,
  searchFunction,
}: {
  filters: Filter[];
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  createSuggestions: (
    params: CreateSuggestionsParams,
  ) => Promise<SearchBarSuggestions>;
  localDispatch: React.Dispatch<SearchBarAction>;
  tokenEquations: SearchBarTokenEquation[];
  searchFunction: (
    equations: SearchBarTokenEquation[],
    setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
  ) => void;
}): { cancelPendingSearch: () => void } {
  // The serialised filters that produced the current tokenEquations
  const currentFiltersRef = useRef<string | null>(null);
  // Guard: skip next inbound sync after an outbound search triggers a filter update
  const isUpdatingFromSearchRef = useRef(false);
  // The last equations string that was actually searched (dedup)
  const lastSearchedEquationsRef = useRef<string>("[]");
  // Debounce timer for outbound search
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Inbound: Filters → TokenEquations ---
  useEffect(() => {
    const newFiltersString = String(
      filters.map((filter) => JSON.stringify(filter)),
    );

    if (isUpdatingFromSearchRef.current) {
      isUpdatingFromSearchRef.current = false;
      currentFiltersRef.current = newFiltersString;
      return;
    }
    if (currentFiltersRef.current === newFiltersString) return;

    let cancelled = false;

    async function load() {
      const promises = filters.map(async (filter, filterIndex) =>
        convertFilterToTokenEquation(filter, filterIndex, createSuggestions),
      );
      const newTokenEquations = await Promise.all(promises);
      if (!cancelled) {
        currentFiltersRef.current = newFiltersString;
        localDispatch({ type: "SET_EQUATIONS", equations: newTokenEquations });
      }
    }

    if (filters.length !== 0) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [filters, createSuggestions, localDispatch]);

  // --- Outbound: TokenEquations → Filters (debounced) ---
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const allEquationsValid = tokenEquations.every(
      (eq) => eq.status === EquationStatus.VALID,
    );

    const currentEquationsString = JSON.stringify(
      tokenEquations.map((eq) => ({
        items: eq.items.map((item) => ({
          label: item.label,
          type: item.type,
        })),
        status: eq.status,
      })),
    );

    const hasChanged =
      currentEquationsString !== lastSearchedEquationsRef.current;

    if (allEquationsValid && hasChanged) {
      searchTimerRef.current = setTimeout(() => {
        isUpdatingFromSearchRef.current = true;
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

  const cancelPendingSearch = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
  };

  return { cancelPendingSearch };
}
