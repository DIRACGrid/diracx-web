"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Alert,
  Box,
  IconButton,
  Popover,
  Typography,
  Tooltip,
} from "@mui/material";
import HelpOutline from "@mui/icons-material/HelpOutline";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { useDiracxUrl } from "../../hooks/utils";
import {
  SearchBar,
  CreateSuggestionsParams,
} from "../shared/SearchBar/SearchBar";
import {
  Filter,
  JobSummary,
  SearchBarSuggestions,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBody,
  Operators,
  SearchBarTokenNature,
  CategoryType,
} from "../../types";
import { getJobSummary } from "./jobDataService";
import { fromHumanReadableText } from "./jobColumns";
import { JobColumnDef, useJobMonitorApi } from "./JobMonitorContext";

interface JobSearchBarProps {
  /** The filters */
  filters: Filter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** The function to apply the filters */
  handleApplyFilters: () => void;
}

export const JobSearchBar = memo(function JobSearchBar({
  filters,
  searchBody,
  setFilters,
  handleApplyFilters,
}: JobSearchBarProps) {
  const { columns, mutateJobs } = useJobMonitorApi();

  // Authentication
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);

  const diracxUrl = useDiracxUrl();

  const [helpAnchorEl, setHelpAnchorEl] = useState<HTMLElement | null>(null);
  const [suggestionError, setSuggestionError] = useState(false);

  // Debounce filter application to avoid redundant API calls on rapid changes
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Skip the first run (the persisted searchBody already reflects the
  // restored filters) and skip when the filters have not actually changed.
  const isFirstApplyRunRef = useRef(true);
  const lastAppliedFiltersRef = useRef<string | null>(null);
  useEffect(() => {
    const serializedFilters = JSON.stringify(filters);
    if (isFirstApplyRunRef.current) {
      isFirstApplyRunRef.current = false;
      lastAppliedFiltersRef.current = serializedFilters;
      return;
    }
    if (serializedFilters === lastAppliedFiltersRef.current) return;

    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      lastAppliedFiltersRef.current = serializedFilters;
      handleApplyFilters();
    }, 300);
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    };
  }, [filters, handleApplyFilters]);

  const createSuggestionsCallback = useCallback(
    async ({
      previousToken,
      previousEquation,
      equationIndex,
      signal,
    }: CreateSuggestionsParams) => {
      // Clear error on new suggestion fetch attempt
      setSuggestionError(false);
      try {
        return await createSuggestions({
          diracxUrl,
          accessToken,
          previousToken,
          previousEquation,
          columns,
          searchBody,
          searchBodyIndex: equationIndex,
          signal,
        });
      } catch (error) {
        // An aborted request (effect cleanup/re-run) is not an error
        if (!(error instanceof Error && error.name === "AbortError")) {
          setSuggestionError(true);
        }
        return { items: [], nature: [], type: [] };
      }
    },
    [diracxUrl, accessToken, columns, searchBody],
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <SearchBar
          filters={filters}
          setFilters={setFilters}
          refreshFunction={mutateJobs}
          createSuggestions={createSuggestionsCallback}
          allowKeyWordSearch={false}
        />
        {suggestionError && (
          <Alert severity="warning" sx={{ mt: 0.5, py: 0, fontSize: "0.8rem" }}>
            Could not load suggestions
          </Alert>
        )}
      </Box>
      <Tooltip title="Filter help">
        <IconButton
          size="small"
          sx={{ mt: 0.75, ml: 0.5 }}
          onClick={(e) => setHelpAnchorEl(e.currentTarget)}
          aria-label="Filter syntax help"
        >
          <HelpOutline fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(helpAnchorEl)}
        anchorEl={helpAnchorEl}
        onClose={() => setHelpAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter syntax
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Click a suggestion or type to add a filter</li>
            <li>
              Example: <strong>Status = Running</strong>
            </li>
            <li>Multiple filters are combined with AND logic</li>
            <li>Click a token to change its value</li>
            <li>Use the clear button to remove all filters</li>
          </Typography>
        </Box>
      </Popover>
    </Box>
  );
});

/**
 * Module-level cache for value-suggestion `jobs/summary` group-by results,
 * keyed by (grouping category + serialized search-body prefix). Re-focusing
 * the same value slot therefore does not re-POST an expensive group-by.
 * Entries are invalidated naturally by key content: any change to the
 * filters ahead of the slot produces a different key. Failed/aborted
 * requests are evicted so they can be retried.
 */
const suggestionSummaryCache = new Map<string, Promise<JobSummary[]>>();
/** Bound the cache size (FIFO eviction) to avoid unbounded growth */
const SUGGESTION_CACHE_MAX_ENTRIES = 50;

function fetchJobSummaryCached(
  diracxUrl: string,
  category: string,
  accessToken: string,
  searchBody: SearchBody,
  signal?: AbortSignal,
): Promise<JobSummary[]> {
  const key = `${diracxUrl}::${category}::${JSON.stringify(searchBody.search ?? [])}`;

  const cached = suggestionSummaryCache.get(key);
  if (cached) return cached;

  const promise = getJobSummary(
    diracxUrl,
    [category],
    accessToken,
    searchBody,
    signal,
  ).then(
    (result) => result.data || [],
    (error) => {
      // Do not cache failures (including aborts) — let a retry re-fetch
      suggestionSummaryCache.delete(key);
      throw error;
    },
  );

  if (suggestionSummaryCache.size >= SUGGESTION_CACHE_MAX_ENTRIES) {
    const oldestKey = suggestionSummaryCache.keys().next().value;
    if (oldestKey !== undefined) suggestionSummaryCache.delete(oldestKey);
  }
  suggestionSummaryCache.set(key, promise);
  return promise;
}

/**
 * Creates suggestions for the search bar based on the current tokens
 */
async function createSuggestions({
  diracxUrl,
  accessToken,
  previousToken,
  previousEquation,
  columns,
  searchBody,
  searchBodyIndex,
  signal,
}: {
  diracxUrl: string | null;
  accessToken: string | undefined;
  previousToken: SearchBarToken | undefined;
  previousEquation: SearchBarTokenEquation | undefined;
  columns: JobColumnDef[];
  searchBody?: SearchBody;
  searchBodyIndex?: number;
  signal?: AbortSignal;
}): Promise<SearchBarSuggestions> {
  let data: JobSummary[] = [];

  const search = [...(searchBody?.search || [])];
  const newSearchBody = {
    ...searchBody,
    search: search.slice(0, searchBodyIndex),
  };

  const fetchJobSummary = async (category: string) => {
    if (diracxUrl && accessToken) {
      data = await fetchJobSummaryCached(
        diracxUrl,
        category,
        accessToken,
        newSearchBody,
        signal,
      );
    }
  };

  if (
    !previousToken ||
    !previousEquation ||
    previousEquation.items.length === 0 ||
    previousToken.nature === SearchBarTokenNature.CUSTOM ||
    previousToken.nature === SearchBarTokenNature.VALUE
  ) {
    const items = columns.map((column) => String(column.header));
    const type = columns.map(
      (column) => column.meta?.type || CategoryType.STRING,
    ) as CategoryType[];

    return {
      items: items,
      type,
      nature: Array(items.length).fill(SearchBarTokenNature.CATEGORY),
    };
  }

  if (previousToken.nature === SearchBarTokenNature.OPERATOR) {
    if (previousToken.label === Operators.LAST.getDisplay()) {
      return {
        items: ["minute", "hour", "day", "week", "month", "year"],
        nature: Array(6).fill(SearchBarTokenNature.VALUE),
        type: Array(6).fill(CategoryType.DATE),
      };
    }

    const hideSuggestion = columns.some(
      (column) =>
        column.header === previousEquation.items[0].label &&
        column.meta?.isQuasiUnique === true,
    );

    if (!hideSuggestion) {
      const category = fromHumanReadableText(
        String(previousEquation.items[0].label),
        columns,
      );

      await fetchJobSummary(category);
      const items = data.map((item) =>
        String(item[category as keyof JobSummary]),
      );

      return {
        items: items,
        nature: Array(items.length).fill(SearchBarTokenNature.VALUE),
        type: Array(items.length).fill(previousToken.type),
      };
    }
  }
  if (previousToken.nature === SearchBarTokenNature.CATEGORY) {
    let items: string[] = [];
    switch (previousToken.type) {
      case CategoryType.STRING:
        items = Operators.getStringOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.STRING),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
        };
      case CategoryType.NUMBER:
        items = Operators.getNumberOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.NUMBER),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
        };
      case CategoryType.BOOLEAN:
        items = Operators.getBooleanOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.BOOLEAN),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
        };
      case CategoryType.DATE:
        items = Operators.getDateOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.DATE),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
        };
      case CategoryType.CUSTOM:
        items = Operators.getDefaultOperators().map((op) => op.getDisplay());
        return {
          items: items,
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
          type: Array(items.length).fill(CategoryType.CUSTOM),
        };

      default:
        return {
          items: [],
          nature: [],
          type: [],
        };
    }
  }

  return {
    items: [],
    nature: [],
    type: [],
  };
}
