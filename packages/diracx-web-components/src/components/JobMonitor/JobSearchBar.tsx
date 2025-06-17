"use client";

import { useEffect, useRef } from "react";

import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { useDiracxUrl } from "../../hooks/utils";

import { SearchBar } from "../shared/SearchBar/SearchBar";

import {
  InternalFilter,
  JobSummary,
  SearchBarSuggestions,
  SearchBarToken,
  SearchBarTokenEquation,
  SearchBody,
} from "../../types";

import { getJobSummary } from "./JobDataService";

import { fromHumanReadableText } from "./JobMonitor";

interface JobSearchBarProps {
  /** The filters */
  filters: InternalFilter[];
  /** The function to set the filters */
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>;
  /** The search body to send along with the request */
  searchBody: SearchBody;
  /** The function to apply the filters */
  handleApplyFilters: () => void;
}

export function JobSearchBar({
  filters,
  searchBody,
  setFilters,
  handleApplyFilters,
}: JobSearchBarProps) {
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);
  const oldFilters = useRef<string>("");

  const diracxUrl = useDiracxUrl();

  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    if (oldFilters.current !== currentFilters) {
      oldFilters.current = currentFilters;
      handleApplyFilters();
    }
  }, [filters, handleApplyFilters]);

  return (
    <SearchBar
      filters={filters}
      setFilters={setFilters}
      createSuggestions={(
        previousToken: SearchBarToken | undefined,
        previousEquation: SearchBarTokenEquation | undefined,
      ) =>
        createSuggestions(
          diracxUrl,
          accessToken,
          previousToken,
          previousEquation,
          searchBody,
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
 * @param diracxUrl The base URL of the DiracX API.
 * @param accessToken The access token for authentication, which can be undefined if not authenticated.
 * @param previousToken The previous token, which can be undefined if no token is focused.
 * @param previousEquation The previous equation, which can be undefined if no equation is focused.
 * @param searchBody The search body containing the filters and search criteria, which can be undefined.
 * @returns A list of suggestions based on the current tokens and data.
 */
async function createSuggestions(
  diracxUrl: string | null,
  accessToken: string | undefined,
  previousToken: SearchBarToken | undefined,
  previousEquation: SearchBarTokenEquation | undefined,
  searchBody?: SearchBody,
): Promise<SearchBarSuggestions> {
  let data: JobSummary[] = [];

  const fetchJobSummary = async (category: string) => {
    if (diracxUrl && accessToken) {
      try {
        const result = await getJobSummary(
          diracxUrl,
          [category],
          accessToken,
          searchBody,
        );
        data = result.data || [];
      } catch {
        console.error("Failed to fetch job summary");
      }
    }
  };

  if (
    !previousToken ||
    !previousEquation ||
    previousEquation.items.length === 0 ||
    previousToken.type.startsWith("custom") ||
    previousToken.type === "value"
  ) {
    // The categories to filter by and their types
    return {
      items: [
        "Status",
        "Minor Status",
        "Application Status",
        "Site",
        "Type",
        "Job Group",
        "Owner",
        "Owner Group",
        "VO",
        "User Priority",
        "Reschedule Counter",
        "ID",
        "Submission Time",
        "Last Update Time",
        "Start Execution Time",
        "Last Sign of Life",
        "End Execution Time",
        "Name",
      ],
      type: [
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_string",
        "category_number",
        "category_number",
        "category_number",
        "category_date",
        "category_date",
        "category_date",
        "category_date",
        "category_date",
        "category_string",
      ],
    };
  }

  // Here, we need personalized suggestions based on the previous token
  if (previousToken.type === "operator_string") {
    // Load the suggestions for the selected category
    const category = fromHumanReadableText(
      previousEquation.items[0].label as string,
    );
    await fetchJobSummary(category);
    const items = data.map(
      (item) => item[category as keyof JobSummary] as string,
    );

    return {
      items: items,
      type: Array(items.length).fill("value"),
    };
  }

  // If the previous token is a date operator, we need to provide time units
  if (
    previousToken.type === "operator_date" &&
    previousToken.label === "in the last"
  ) {
    return {
      items: ["minute", "hour", "day", "week", "month", "year"],
      type: Array(6).fill("value"),
    };
  }

  // else
  let suggestions: { items: string[]; type: string[] } = {
    items: [],
    type: [],
  };
  switch (previousToken.type) {
    case "category_string":
      suggestions = {
        items: ["=", "!=", "like", "is in", "is not in"],
        type: Array(5).fill("operator_string"),
      };
      break;
    case "category_number":
      suggestions = {
        items: ["=", "!=", "<", ">", "is in", "is not in", "like"],
        type: Array(7).fill("operator_number"),
      };
      break;
    case "category_boolean":
      suggestions = {
        items: ["=", "!="],
        type: Array(2).fill("operator_bool"),
      };
      break;
    case "category_date":
      suggestions = {
        items: ["<", ">", "in the last"],
        type: Array(3).fill("operator_date"),
      };
      break;
    case "category":
      suggestions = {
        items: ["=", "!=", ">", "<", "like"],
        type: Array(5).fill("operator"),
      };
      break;
    // We don't want suggestions for the number and in case of a custom token
    default:
      suggestions = {
        items: [],
        type: [],
      };
  }
  return suggestions;
}
