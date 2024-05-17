/**
 * Column interface
 * @property {number | string} id - the id of the cell
 * @property {string} label - the label of the cell
 */
export interface Column {
  id: number | string;
  label: string;
  render?: ((value: any) => JSX.Element) | null;
}
