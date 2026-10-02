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

declare global {
  interface Window {
    // TEMPORARY, see hooks/utils.tsx's useDiracxUrl. Set by the consuming
    // app's entry point (e.g. diracx-web's main.tsx) to pass through a
    // bundler-specific env var (Vite's import.meta.env, which this
    // package's own es6-targeted build strips), since this package itself
    // can't read it directly.
    __DIRACX_URL__?: string;
  }
}
