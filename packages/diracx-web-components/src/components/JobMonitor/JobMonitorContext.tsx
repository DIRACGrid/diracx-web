"use client";

import { createContext, useContext } from "react";
import {
  ColumnPinningState,
  RowSelectionState,
  VisibilityState,
  PaginationState,
  ColumnDef,
} from "@tanstack/react-table";
import { Filter } from "../../types/Filter";
import { Job, SearchBody } from "../../types";

/**
 * TanStack Table's ColumnDef is invariant on TValue, so a heterogeneous
 * column array (mixing string, number, Date columns) cannot be typed with
 * a single concrete TValue. We use `any` here as an intentional escape hatch.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JobColumnDef = ColumnDef<Job, any>;

export interface JobMonitorState {
  filters: Filter[];
  searchBody: SearchBody;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
}

export type JobMonitorAction =
  | { type: "SET_FILTERS"; payload: Filter[] | ((prev: Filter[]) => Filter[]) }
  | {
      type: "SET_SEARCH_BODY";
      payload: SearchBody | ((prev: SearchBody) => SearchBody);
    }
  | {
      type: "SET_COLUMN_VISIBILITY";
      payload: VisibilityState | ((prev: VisibilityState) => VisibilityState);
    }
  | {
      type: "SET_COLUMN_PINNING";
      payload:
        | ColumnPinningState
        | ((prev: ColumnPinningState) => ColumnPinningState);
    }
  | {
      type: "SET_ROW_SELECTION";
      payload:
        | RowSelectionState
        | ((prev: RowSelectionState) => RowSelectionState);
    }
  | {
      type: "SET_PAGINATION";
      payload: PaginationState | ((prev: PaginationState) => PaginationState);
    }
  | {
      type: "APPLY_FILTERS";
      columns: JobColumnDef[];
      fromHumanReadableText: (name: string, columns: JobColumnDef[]) => string;
    };

export const defaultColumnVisibility: VisibilityState = {
  JobGroup: false,
  JobType: false,
  Owner: false,
  OwnerGroup: false,
  VO: false,
  StartExecTime: false,
  EndExecTime: false,
  UserPriority: false,
};

export const defaultPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 25,
};

export function jobMonitorReducer(
  state: JobMonitorState,
  action: JobMonitorAction,
): JobMonitorState {
  switch (action.type) {
    case "SET_FILTERS": {
      const filters =
        typeof action.payload === "function"
          ? action.payload(state.filters)
          : action.payload;
      return { ...state, filters };
    }
    case "SET_SEARCH_BODY": {
      const searchBody =
        typeof action.payload === "function"
          ? action.payload(state.searchBody)
          : action.payload;
      return { ...state, searchBody };
    }
    case "SET_COLUMN_VISIBILITY": {
      const columnVisibility =
        typeof action.payload === "function"
          ? action.payload(state.columnVisibility)
          : action.payload;
      return { ...state, columnVisibility };
    }
    case "SET_COLUMN_PINNING": {
      const columnPinning =
        typeof action.payload === "function"
          ? action.payload(state.columnPinning)
          : action.payload;
      return { ...state, columnPinning };
    }
    case "SET_ROW_SELECTION": {
      const rowSelection =
        typeof action.payload === "function"
          ? action.payload(state.rowSelection)
          : action.payload;
      return { ...state, rowSelection };
    }
    case "SET_PAGINATION": {
      const pagination =
        typeof action.payload === "function"
          ? action.payload(state.pagination)
          : action.payload;
      return { ...state, pagination };
    }
    case "APPLY_FILTERS": {
      return {
        ...state,
        searchBody: {
          ...state.searchBody,
          search: state.filters.map(
            ({ parameter, operator, value, values }) => ({
              parameter: action.fromHumanReadableText(
                parameter,
                action.columns,
              ),
              operator,
              value,
              values,
            }),
          ),
        },
        pagination: { ...state.pagination, pageIndex: 0 },
      };
    }
    default:
      return state;
  }
}

/**
 * The Job Monitor context is split in two so that state updates do not
 * re-render consumers that only need the stable API surface:
 * - `JobMonitorStateContext` carries the reducer state (changes often).
 * - `JobMonitorApiContext` carries stable identities (dispatch, columns,
 *   status colors, mutateJobs) and is memoized once per mount.
 */
export const JobMonitorStateContext = createContext<JobMonitorState | null>(
  null,
);

export interface JobMonitorApiValue {
  dispatch: React.Dispatch<JobMonitorAction>;
  columns: JobColumnDef[];
  statusColors: Record<string, string>;
  mutateJobs: () => void;
}

export const JobMonitorApiContext = createContext<JobMonitorApiValue | null>(
  null,
);

export function useJobMonitorState(): JobMonitorState {
  const state = useContext(JobMonitorStateContext);
  if (!state) {
    throw new Error(
      "useJobMonitorState must be used within a JobMonitorStateContext provider",
    );
  }
  return state;
}

export function useJobMonitorApi(): JobMonitorApiValue {
  const api = useContext(JobMonitorApiContext);
  if (!api) {
    throw new Error(
      "useJobMonitorApi must be used within a JobMonitorApiContext provider",
    );
  }
  return api;
}
