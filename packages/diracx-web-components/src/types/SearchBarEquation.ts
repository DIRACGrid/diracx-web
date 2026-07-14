import { EquationStatus } from "./EquationStatus";
import type { SearchBarToken } from "./SearchBarToken";

export type SearchBarTokenEquation = {
  // Stable identifier generated when the equation is created, used as a
  // React key so reordering/deleting equations keeps component state
  // attached to the right equation. Optional on input (e.g. equations built
  // from persisted filters); regenerated when absent.
  id?: string;
  // The status of the equation, e.g., "valid", "invalid", "waiting"
  status: EquationStatus;
  // The items in the equation, which are tokens
  items: SearchBarToken[];
};
