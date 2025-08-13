import type { CategoryType } from "./CategoryType";
import type { SearchBarTokenNature } from "./SearchBarTokenNature";

export type SearchBarSuggestions = {
  /** The list of the suggestions */
  items: string[];
  /** The nature of each suggestion (category, operator, value) */
  nature: SearchBarTokenNature[];
  /** The type of each suggestion (string, number, bool)*/
  type: CategoryType[];
};
