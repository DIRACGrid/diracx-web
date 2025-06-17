"use client";

/** Filter type
 * @property {string} parameter - the column to filter by
 * @property {string} operator - the operator to use for the filter
 * @property {string} value - the value to filter by
 * @property {string[]} values - the values to filter by if they are multiple
 */
export interface Filter {
  parameter: string;
  operator: string;
  value?: string;
  values?: string[];
}
