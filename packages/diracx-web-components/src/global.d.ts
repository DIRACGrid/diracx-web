"use client";

export {};

import "@tanstack/react-table";

import { CategoryType } from "./types";

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
  // Extend ColumnMeta to include custom properties
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: CategoryType;
    values?: string[]; // Optional values for category-type fields
    isQuasiUnique?: boolean; // Some columns are quasi-unique, meaning they can have multiple values but are not fully unique
  }
}
