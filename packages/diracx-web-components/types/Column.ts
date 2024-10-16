/**
 * Column interface
 * @property {number | string} id - the id of the cell
 * @property {string} label - the label of the cell
 * @property {((value: unknown) => JSX.Element) | null} render - an optional render function to display the values
 * @property {string | string[]} type - The type of the values or the list of possible values
 */
export interface Column {
  id: string;
  label: string;
  render?: (value: unknown) => React.ReactNode;
  type?: string | string[];
}
