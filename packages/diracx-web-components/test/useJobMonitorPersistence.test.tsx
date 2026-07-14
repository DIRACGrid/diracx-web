import { renderHook, act } from "@testing-library/react";
import {
  useJobMonitorPersistence,
  loadInitialState,
} from "../src/components/JobMonitor/useJobMonitorPersistence";
import {
  JobMonitorState,
  defaultColumnVisibility,
  defaultPagination,
} from "../src/components/JobMonitor/JobMonitorContext";

const APP_ID = "JobMonitor1";
const STORAGE_KEY = `${APP_ID}_State`;

function makeState(overrides: Partial<JobMonitorState> = {}): JobMonitorState {
  return {
    filters: [{ parameter: "Status", operator: "eq", value: "Running" }],
    searchBody: {
      search: [{ parameter: "Status", operator: "eq", value: "Running" }],
      sort: [{ parameter: "JobID", direction: "desc" }],
    },
    columnVisibility: { JobGroup: false },
    columnPinning: { left: ["JobID"] },
    rowSelection: { "42": true },
    pagination: { pageIndex: 2, pageSize: 50 },
    ...overrides,
  };
}

describe("useJobMonitorPersistence", () => {
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    window.sessionStorage.clear();
    setItemSpy = jest.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    jest.useRealTimers();
  });

  it("persists the state after the 500ms debounce, not before", () => {
    const state = makeState();
    renderHook(() => useJobMonitorPersistence(APP_ID, state));

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(setItemSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(setItemSpy).toHaveBeenCalledTimes(1);

    const [key, value] = setItemSpy.mock.calls[0];
    expect(key).toBe(STORAGE_KEY);
    const persisted = JSON.parse(value);
    expect(persisted.filters).toEqual(state.filters);
    expect(persisted.columnVisibility).toEqual(state.columnVisibility);
    expect(persisted.columnPinning).toEqual(state.columnPinning);
    expect(persisted.pagination).toEqual(state.pagination);
  });

  it("debounces successive state changes into a single write", () => {
    const { rerender } = renderHook(
      ({ state }: { state: JobMonitorState }) =>
        useJobMonitorPersistence(APP_ID, state),
      { initialProps: { state: makeState() } },
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });
    const updated = makeState({ pagination: { pageIndex: 5, pageSize: 50 } });
    rerender({ state: updated });

    // The first timer was reset: 300 + 300 > 500 but no write yet
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(setItemSpy).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    const persisted = JSON.parse(setItemSpy.mock.calls[0][1]);
    expect(persisted.pagination).toEqual({ pageIndex: 5, pageSize: 50 });
  });

  it("does not persist rowSelection", () => {
    const state = makeState({ rowSelection: { "1": true, "2": true } });
    renderHook(() => useJobMonitorPersistence(APP_ID, state));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const persisted = JSON.parse(setItemSpy.mock.calls[0][1]);
    expect(persisted).not.toHaveProperty("rowSelection");
    expect(Object.keys(persisted).sort()).toEqual([
      "columnPinning",
      "columnVisibility",
      "filters",
      "pagination",
    ]);
  });

  it("flushes the latest state on unmount before the debounce fires", () => {
    const { rerender, unmount } = renderHook(
      ({ state }: { state: JobMonitorState }) =>
        useJobMonitorPersistence(APP_ID, state),
      { initialProps: { state: makeState() } },
    );

    const updated = makeState({ pagination: { pageIndex: 7, pageSize: 25 } });
    rerender({ state: updated });

    // Unmount before the 500ms debounce elapses
    unmount();

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    const [key, value] = setItemSpy.mock.calls[0];
    expect(key).toBe(STORAGE_KEY);
    expect(JSON.parse(value).pagination).toEqual({
      pageIndex: 7,
      pageSize: 25,
    });
  });
});

describe("loadInitialState", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("restores persisted state and always resets rowSelection to {}", () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        filters: [{ parameter: "Site", operator: "eq", value: "LCG.CERN.ch" }],
        columnVisibility: { Owner: true },
        columnPinning: { left: ["JobID", "Status"] },
        pagination: { pageIndex: 3, pageSize: 100 },
        // Simulate a stale persisted selection from an older version
        rowSelection: { "1": true },
      }),
    );

    const state = loadInitialState(APP_ID);

    expect(state.filters).toEqual([
      { parameter: "Site", operator: "eq", value: "LCG.CERN.ch" },
    ]);
    // The search body is rebuilt from the persisted filters
    expect(state.searchBody.search).toEqual([
      {
        parameter: "Site",
        operator: "eq",
        value: "LCG.CERN.ch",
        values: undefined,
      },
    ]);
    expect(state.columnVisibility).toEqual({ Owner: true });
    expect(state.columnPinning).toEqual({ left: ["JobID", "Status"] });
    expect(state.pagination).toEqual({ pageIndex: 3, pageSize: 100 });
    // Row selection is deliberately never restored
    expect(state.rowSelection).toEqual({});
  });

  it("returns defaults when nothing is persisted", () => {
    const state = loadInitialState(APP_ID);

    expect(state.filters).toEqual([]);
    expect(state.searchBody).toEqual({
      search: [],
      sort: [{ parameter: "JobID", direction: "desc" }],
    });
    expect(state.columnVisibility).toEqual(defaultColumnVisibility);
    expect(state.columnPinning).toEqual({ left: ["JobID"] });
    expect(state.rowSelection).toEqual({});
    expect(state.pagination).toEqual(defaultPagination);
  });

  it("falls back to defaults and warns on corrupt JSON", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    window.sessionStorage.setItem(STORAGE_KEY, "{not valid json");

    const state = loadInitialState(APP_ID);

    expect(warnSpy).toHaveBeenCalled();
    expect(state.filters).toEqual([]);
    expect(state.columnVisibility).toEqual(defaultColumnVisibility);
    expect(state.pagination).toEqual(defaultPagination);
    expect(state.rowSelection).toEqual({});

    warnSpy.mockRestore();
  });
});
