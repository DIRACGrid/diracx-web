import React from "react";

import { SearchBarTokenEquation, Filter, Operators } from "../../../types";

/**
 * Function to convert token equations to internal filters
 * @param equations The token equations to convert
 * @param setFilters The function to set the filters state
 */
export function convertAndApplyFilters(
  equations: SearchBarTokenEquation[],
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
) {
  const newFilters: Filter[] = [];

  equations.forEach((equation) => {
    if (equation.items.length === 3) {
      let value = undefined;
      let values = undefined;
      if (
        equation.items[1].label === Operators.IN.getDisplay() ||
        equation.items[1].label === Operators.NOT_IN.getDisplay()
      ) {
        // Handle multi-value filters
        values = Array.isArray(equation.items[2].label)
          ? equation.items[2].label
          : [equation.items[2].label];
      } else {
        // Handle single-value filters
        value =
          typeof equation.items[2].label === "string"
            ? equation.items[2].label
            : undefined;
      }

      newFilters.push({
        parameter: equation.items[0].label as string,
        operator: Operators.getInternalFromDisplay(
          equation.items[1].label as string,
        ),
        value: value,
        values: values,
      });
    }
  });
  setFilters(newFilters);
}

/**
 * Function to clear the filters and token equations
 * @param setFilters Function to set the filters state
 * @param setTokenEquations Function to set the token equations state
 */
export function defaultClearFunction(
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>,
  setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  >,
) {
  setFilters([]);
  setTokenEquations([]);
}
