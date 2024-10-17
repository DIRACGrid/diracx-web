export {};

import "@tanstack/react-table";

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
  // Extend ColumnMeta to include custom properties
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: "string" | "number" | "date" | "category";
    values?: string[]; // Optional values for category-type fields
  }
}
