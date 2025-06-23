"use client";

import { useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { useDiracxUrl } from "../../hooks/utils";
import { SearchBar } from "../shared/SearchBar/SearchBar";
import {
  Filter,
  JobSummary,
  SearchBarSuggestions,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBody,
  Job,
  Operators,
  SearchBarTokenNature,
  CategoryType,
} from "../../types";
import { getJobSummary } from "./jobDataService";
import { fromHumanReadableText } from "./JobMonitor";

interface JobSearchBarProps {
  /** The filters */
  filters: Filter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** The function to apply the filters */
  handleApplyFilters: () => void;
  /** The columns to display in the job monitor */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[];
}

export function JobSearchBar({
  filters,
  searchBody,
  setFilters,
  handleApplyFilters,
  columns,
}: JobSearchBarProps) {
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);

  const diracxUrl = useDiracxUrl();

  useEffect(() => {
    handleApplyFilters();
  }, [filters, handleApplyFilters]);

  return (
    <SearchBar
      filters={filters}
      setFilters={setFilters}
      createSuggestions={(
        previousToken: SearchBarToken | undefined,
        previousEquation: SearchBarTokenEquation | undefined,
        equationIndex?: number,
      ) =>
        createSuggestions(
          diracxUrl,
          accessToken,
          previousToken,
          previousEquation,
          columns,
          searchBody,
          equationIndex,
        )
      }
      allowKeyWordSearch={false} // Disable keyword search for job monitor
    />
  );
}

/**
 * Creates suggestions for the search bar based on the current tokens
 * If necessary, it fetches job summaries from the server to get personalized suggestions
 *
 * @param diracxUrl The URL of the DiracX server.
 * @param accessToken The access token for authentication, which can be undefined if not authenticated.
 * @param previousToken The previous token, which can be undefined if no token is focused.
 * @param previousEquation The previous equation, which can be undefined if no equation is focused.
 * @param columns The columns to be used for suggestions, which are used to determine the categories and types.
 * @param searchBody The search body to be sent along with the request (optional).
 * @param searchBodyIndex The index of the search body, which is used to determine the current search context (optional).
 * @returns A list of suggestions based on the current tokens and data.
 */
async function createSuggestions(
  diracxUrl: string | null,
  accessToken: string | undefined,
  previousToken: SearchBarToken | undefined,
  previousEquation: SearchBarTokenEquation | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[],
  searchBody: SearchBody,
  searchBodyIndex?: number,
): Promise<SearchBarSuggestions> {
  let data: JobSummary[] = [];

  const search = [...(searchBody?.search || [])];

  const newSearchBody = {
    ...searchBody,
    search: search.slice(0, searchBodyIndex),
  };

  const fetchJobSummary = async (category: string) => {
    if (diracxUrl && accessToken) {
      try {
        const result = await getJobSummary(
          diracxUrl,
          [category],
          accessToken,
          newSearchBody,
        );
        data = result.data || [];
      } catch {
        throw new Error("Failed to fetch job summary");
      }
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
    const hideSuggestion = columns.map(
      (column) => column.meta?.isQuasiUnique || false,
    );

    return {
      items: items,
      type,
      nature: Array(items.length).fill(SearchBarTokenNature.CATEGORY),
      hideSuggestion: hideSuggestion,
    };
  }

  // Here, we need personalized suggestions based on the previous token
  if (previousToken.nature === SearchBarTokenNature.OPERATOR) {
    if (previousToken.label === Operators.LAST.getDisplay()) {
      return {
        items: ["minute", "hour", "day", "week", "month", "year"],
        nature: Array(6).fill(SearchBarTokenNature.VALUE),
        type: Array(6).fill(CategoryType.DATE),
        hideSuggestion: Array(6).fill(previousToken.hideSuggestion),
      };
    }

    if (!previousToken.hideSuggestion) {
      // Load the suggestions for the selected category
      const category = fromHumanReadableText(
        String(previousEquation.items[0].label),
        columns,
      );
      await fetchJobSummary(category);
      const items = data.map(
        (item) => item[category as keyof JobSummary] as string,
      );

      return {
        items: items,
        nature: Array(items.length).fill(SearchBarTokenNature.VALUE),
        type: Array(items.length).fill(CategoryType.STRING),
        hideSuggestion: Array(items.length).fill(previousToken.hideSuggestion),
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
          hideSuggestion: Array(items.length).fill(
            previousToken.hideSuggestion,
          ),
        };
      case CategoryType.NUMBER:
        items = Operators.getNumberOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.NUMBER),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
          hideSuggestion: Array(items.length).fill(
            previousToken.hideSuggestion,
          ),
        };
      case CategoryType.BOOLEAN:
        items = Operators.getBooleanOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.BOOLEAN),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
          hideSuggestion: Array(items.length).fill(
            previousToken.hideSuggestion,
          ),
        };
      case CategoryType.DATE:
        items = Operators.getDateOperators().map((op) => op.getDisplay());
        return {
          items: items,
          type: Array(items.length).fill(CategoryType.DATE),
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
          hideSuggestion: Array(items.length).fill(
            previousToken.hideSuggestion,
          ),
        };
      case CategoryType.CUSTOM:
        items = Operators.getDefaultOperators().map((op) => op.getDisplay());
        return {
          items: items,
          nature: Array(items.length).fill(SearchBarTokenNature.OPERATOR),
          type: Array(items.length).fill(CategoryType.CUSTOM),
          hideSuggestion: Array(items.length).fill(
            previousToken.hideSuggestion,
          ),
        };

      // We don't want suggestions for the number and in case of a custom token
      default:
        return {
          items: [],
          nature: [],
          type: [],
          hideSuggestion: [],
        };
    }
  }

  return {
    items: [],
    nature: [],
    type: [],
    hideSuggestion: [],
  };
}
