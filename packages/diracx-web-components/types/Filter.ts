/** Filter type
 * @property {number} id - the id of the filter
 * @property {string} column - the column to filter by
 * @property {string} operator - the operator to use for the filter
 * @property {string} value - the value to filter by
 * @property {string[]} values - the values to filter by if there are multiple
 */
export interface Filter {
  id: number;
  column: string;
  operator: string;
  value?: string;
  values?: string[];
}
