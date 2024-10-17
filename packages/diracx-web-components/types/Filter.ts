/** Filter type
 * @property {number} id - the id of the filter
 * @property {string} column - the column to filter by
 * @property {string} operator - the operator to use for the filter
 * @property {string} value - the value to filter by
 * @property {string[]} values - the values to filter by if there are multiple
 */
export interface Filter {
  parameter: string;
  operator: string;
  value?: string;
  values?: string[];
}

/** Internal Filter type
 * @property {number} id - the id of the filter
 */
export interface InternalFilter extends Filter {
  id: number;
}
