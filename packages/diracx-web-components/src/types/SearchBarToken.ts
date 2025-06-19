export type SearchBarToken = {
  // The label can be a single string or an array of strings for multi-value tokens
  label: string | string[];
  // The type of the token, e.g., "category", "operator", "value", ...
  type: string;
  // Optional ID for the token, useful for tracking or identification purposes
  id?: string;
  // Optional suggestions for the token, useful for auto-completion or hints
  suggestions?: { items: string[]; type: string[] };
};
