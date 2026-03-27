"use client";

import { useEffect, useRef } from "react";
import { Filter } from "../../types/Filter";
import {
  JobMonitorState,
  defaultColumnVisibility,
  defaultPagination,
} from "./JobMonitorContext";

/**
 * Loads the initial JobMonitor state from sessionStorage.
 * Used as the initializer function for useReducer.
 */
export function loadInitialState(appId: string): JobMonitorState {
  const raw = sessionStorage.getItem(`${appId}_State`);
  let parsed = null;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn(
        `Failed to parse JobMonitor state from sessionStorage for "${appId}". Using defaults.`,
      );
    }
  }
  return {
    filters: parsed?.filters ?? [],
    searchBody: {
      search: parsed?.filters
        ? parsed.filters.map((filter: Filter) => ({
            parameter: filter.parameter,
            operator: filter.operator,
            value: filter.value,
            values: filter.values,
          }))
        : [],
      sort: [{ parameter: "JobID", direction: "desc" }],
    },
    columnVisibility: parsed?.columnVisibility ?? defaultColumnVisibility,
    columnPinning: parsed?.columnPinning ?? { left: ["JobID"] },
    rowSelection: parsed?.rowSelection ?? {},
    pagination: parsed?.pagination ?? defaultPagination,
  };
}

/** Serializes the persisted subset of state. */
function serializeState(s: JobMonitorState): string {
  return JSON.stringify({
    filters: s.filters,
    columnVisibility: s.columnVisibility,
    columnPinning: s.columnPinning,
    rowSelection: s.rowSelection,
    pagination: s.pagination,
  });
}

/**
 * Persists JobMonitor state to sessionStorage with 500ms debounce
 * and flushes on unmount.
 */
export function useJobMonitorPersistence(
  appId: string,
  state: JobMonitorState,
) {
  // Keep a ref to the latest state so the unmount handler can flush it
  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  });

  // Debounced save to sessionStorage (500ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      sessionStorage.setItem(
        `${appId}_State`,
        serializeState(latestStateRef.current),
      );
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [appId, state]);

  // Flush on unmount so the last state is always persisted
  useEffect(() => {
    return () => {
      sessionStorage.setItem(
        `${appId}_State`,
        serializeState(latestStateRef.current),
      );
    };
  }, [appId]);
}
