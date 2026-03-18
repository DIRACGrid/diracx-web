import { act, renderHook, waitFor } from "@testing-library/react";
import { useFilterSync } from "../src/components/shared/SearchBar/useFilterSync";
import {
  CategoryType,
  EquationStatus,
  SearchBarTokenNature,
  Filter,
  SearchBarSuggestions,
  SearchBarTokenEquation,
} from "../src/types";

const categorySuggestions: SearchBarSuggestions = {
  items: ["JobID", "Status"],
  nature: [SearchBarTokenNature.CATEGORY, SearchBarTokenNature.CATEGORY],
  type: [CategoryType.NUMBER, CategoryType.STRING],
};

const validEquation: SearchBarTokenEquation = {
  id: "eq-1",
  status: EquationStatus.VALID,
  items: [
    {
      label: "Status",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.CATEGORY,
    },
    {
      label: "=",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.OPERATOR,
    },
    {
      label: "Running",
      type: CategoryType.STRING,
      nature: SearchBarTokenNature.VALUE,
    },
  ],
};

type HookProps = Parameters<typeof useFilterSync>[0];

function makeProps(overrides: Partial<HookProps> = {}): HookProps {
  return {
    filters: [],
    setFilters: jest.fn(),
    createSuggestions: jest.fn(async () => categorySuggestions),
    localDispatch: jest.fn(),
    tokenEquations: [],
    searchFunction: jest.fn(),
    ...overrides,
  };
}

/** Extract the payloads of every SET_EQUATIONS dispatch. */
function setEquationsCalls(localDispatch: jest.Mock) {
  return localDispatch.mock.calls
    .filter(([action]) => action.type === "SET_EQUATIONS")
    .map(([action]) => action.equations as SearchBarTokenEquation[]);
}

describe("useFilterSync", () => {
  describe("inbound sync (filters -> tokenEquations)", () => {
    it("converts external filters into token equations", async () => {
      const localDispatch = jest.fn();
      const filters: Filter[] = [
        { parameter: "JobID", operator: "eq", value: "12345" },
      ];

      renderHook((props: HookProps) => useFilterSync(props), {
        initialProps: makeProps({ filters, localDispatch }),
      });

      // Conversion is async (it fetches suggestions per filter)
      await waitFor(() => {
        expect(setEquationsCalls(localDispatch).length).toBeGreaterThan(0);
      });

      const equations = setEquationsCalls(localDispatch).at(-1)!;
      expect(equations).toHaveLength(1);
      expect(equations[0].status).toBe(EquationStatus.VALID);
      expect(equations[0].items.map((item) => item.label)).toEqual([
        "JobID",
        "=",
        "12345",
      ]);
    });

    it("clears token equations when all filters are removed externally", async () => {
      // Regression test: clearing all filters (e.g. from a pie chart or an
      // external caller) must clear the token equations instead of leaving
      // stale tokens in the search bar.
      const localDispatch = jest.fn();
      const initialProps = makeProps({
        filters: [{ parameter: "JobID", operator: "eq", value: "12345" }],
        localDispatch,
      });

      const { rerender } = renderHook(
        (props: HookProps) => useFilterSync(props),
        { initialProps },
      );

      await waitFor(() => {
        expect(setEquationsCalls(localDispatch).length).toBeGreaterThan(0);
      });

      rerender({ ...initialProps, filters: [] });

      // The empty-filters branch dispatches synchronously
      const lastEquations = setEquationsCalls(localDispatch).at(-1);
      expect(lastEquations).toEqual([]);
    });

    it("does not re-dispatch when the filters are unchanged", async () => {
      const localDispatch = jest.fn();
      const filters: Filter[] = [
        { parameter: "JobID", operator: "eq", value: "12345" },
      ];
      const initialProps = makeProps({ filters, localDispatch });

      const { rerender } = renderHook(
        (props: HookProps) => useFilterSync(props),
        { initialProps },
      );

      await waitFor(() => {
        expect(setEquationsCalls(localDispatch)).toHaveLength(1);
      });

      // Same filters reference: the inbound effect must not run again
      rerender({ ...initialProps });
      await act(async () => {});
      expect(setEquationsCalls(localDispatch)).toHaveLength(1);
    });
  });

  describe("outbound sync (tokenEquations -> filters, debounced)", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("calls searchFunction after the 800ms debounce when all equations are valid", () => {
      const searchFunction = jest.fn();
      const setFilters = jest.fn();
      const props = makeProps({
        tokenEquations: [validEquation],
        searchFunction,
        setFilters,
      });

      renderHook((p: HookProps) => useFilterSync(p), { initialProps: props });

      act(() => {
        jest.advanceTimersByTime(799);
      });
      expect(searchFunction).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(searchFunction).toHaveBeenCalledTimes(1);
      expect(searchFunction).toHaveBeenCalledWith([validEquation], setFilters);
    });

    it("does not search while an equation is still invalid", () => {
      const searchFunction = jest.fn();
      const invalidEquation: SearchBarTokenEquation = {
        ...validEquation,
        status: EquationStatus.INVALID,
      };

      renderHook((p: HookProps) => useFilterSync(p), {
        initialProps: makeProps({
          tokenEquations: [validEquation, invalidEquation],
          searchFunction,
        }),
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(searchFunction).not.toHaveBeenCalled();
    });

    it("does not search again for equations with identical content", () => {
      const searchFunction = jest.fn();
      const props = makeProps({
        tokenEquations: [validEquation],
        searchFunction,
      });

      const { rerender } = renderHook((p: HookProps) => useFilterSync(p), {
        initialProps: props,
      });

      act(() => {
        jest.advanceTimersByTime(800);
      });
      expect(searchFunction).toHaveBeenCalledTimes(1);

      // New array identity, same content: must be deduplicated
      rerender({
        ...props,
        tokenEquations: [{ ...validEquation, items: [...validEquation.items] }],
      });
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(searchFunction).toHaveBeenCalledTimes(1);
    });

    it("cancelPendingSearch cancels a scheduled search", () => {
      const searchFunction = jest.fn();
      const { result } = renderHook((p: HookProps) => useFilterSync(p), {
        initialProps: makeProps({
          tokenEquations: [validEquation],
          searchFunction,
        }),
      });

      act(() => {
        result.current.cancelPendingSearch();
        jest.advanceTimersByTime(2000);
      });
      expect(searchFunction).not.toHaveBeenCalled();
    });

    it("skips the inbound sync triggered by its own search", async () => {
      const searchFunction = jest.fn();
      const localDispatch = jest.fn();
      const props = makeProps({
        tokenEquations: [validEquation],
        searchFunction,
        localDispatch,
      });

      const { rerender } = renderHook((p: HookProps) => useFilterSync(p), {
        initialProps: props,
      });
      // Mount with empty filters dispatches an initial empty SET_EQUATIONS
      const initialDispatches = setEquationsCalls(localDispatch).length;

      act(() => {
        jest.advanceTimersByTime(800);
      });
      expect(searchFunction).toHaveBeenCalledTimes(1);

      // Simulate searchFunction having updated the filters prop: the inbound
      // effect must skip this self-inflicted update (no equation rebuild,
      // which would wipe suggestions attached to the current tokens)
      rerender({
        ...props,
        filters: [{ parameter: "Status", operator: "eq", value: "Running" }],
      });
      await act(async () => {});
      expect(setEquationsCalls(localDispatch)).toHaveLength(initialDispatches);

      // A later, genuinely external filters change must sync again
      rerender({
        ...props,
        filters: [{ parameter: "JobID", operator: "eq", value: "999" }],
      });
      await act(async () => {});
      const lastEquations = setEquationsCalls(localDispatch).at(-1)!;
      expect(setEquationsCalls(localDispatch).length).toBeGreaterThan(
        initialDispatches,
      );
      expect(lastEquations[0].items[0].label).toBe("JobID");
    });
  });
});
