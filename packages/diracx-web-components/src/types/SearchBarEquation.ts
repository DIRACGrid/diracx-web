import type { SearchBarToken } from "./SearchBarToken";

export type SearchBarTokenEquation = {
  // The status of the equation, e.g., "valid", "invalid", "waiting"
  status: string;
  // The items in the equation, which are tokens
  items: SearchBarToken[];
};
