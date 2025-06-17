import type { SearchBarSuggestions } from "./SearchBarSuggestions";
import type { CategoryType } from "./CategoryType";
import type { SearchBarTokenNature } from "./SearchBarTokenNature";

export type SearchBarToken = {
  /** The label can be a single string or an array of strings for multi-value tokens */
  label: string | string[];
  /** The type of the token, e.g., "string", "number", "bool", ... */
  type: CategoryType;
  /** The nature of the token, e.g., "category", "operator", "value" */
  nature: SearchBarTokenNature;
  /** Boolean indicating if we should hide the suggestions */
  hideSuggestion: boolean;
  /** Optional suggestions for the token, useful for auto-completion or hints */
  suggestions?: SearchBarSuggestions;
};
