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
  JobMonitorChartType,
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
  /** Function to mutate the job data */
  mutateJobs: () => void;
  /** Props for the plot type selector */
  plotTypeSelectorProps?: {
    /** The type of the plot */
    plotType: JobMonitorChartType;
    /** Function to set the plot type */
    setPlotType: React.Dispatch<React.SetStateAction<JobMonitorChartType>>;
    /** List of buttons to select the type of plot */
    buttonList?: { plotName: JobMonitorChartType; icon: React.ReactNode }[];
  };
}

export function JobSearchBar({
  filters,
  searchBody,
  setFilters,
  handleApplyFilters,
  columns,
  mutateJobs,
  plotTypeSelectorProps,
}: JobSearchBarProps) {
  // Authentication
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
      refreshFunction={mutateJobs}
      createSuggestions={({ previousToken, previousEquation, equationIndex }) =>
        createSuggestions({
          diracxUrl,
          accessToken,
          previousToken,
          previousEquation,
          columns,
          searchBody,
          searchBodyIndex: equationIndex,
        })
      }
      allowKeyWordSearch={false} // Disable keyword search for job monitor
      plotTypeSelectorProps={plotTypeSelectorProps}
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
async function createSuggestions({
  diracxUrl,
  accessToken,
  previousToken,
  previousEquation,
  columns,
  searchBody,
  searchBodyIndex,
}: {
  diracxUrl: string | null;
  accessToken: string | undefined;
  previousToken: SearchBarToken | undefined;
  previousEquation: SearchBarTokenEquation | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[];
  searchBody?: SearchBody;
  searchBodyIndex?: number;
}): Promise<SearchBarSuggestions> {
  let data: JobSummary[] = [];

  const search = [...(searchBody?.search || [])];
  /** The search body index is used to determine the current search context */
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

    return {
      items: items,
      type,
      nature: Array(items.length).fill(SearchBarTokenNature.CATEGORY),
    };
  }

  // Here, we need personalized suggestions based on the previous token
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
      // Load the suggestions for the selected category

      /**
       * The internal name of the category is used to fetch the job summary
       */
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
