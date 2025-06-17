import React from "react";

import type { SearchBarTokenEquation, InternalFilter } from "../../../types";

/**
 * Function to convert token equations to internal filters
 * @param equations The token equations to convert
 * @param setFilters The function to set the filters state
 */
export function convertAndApplyFilters(
  equations: SearchBarTokenEquation[],
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>,
) {
  /**
   * Mapping of operator labels to internal filter operators.
   */
  const operators = {
    "=": "eq",
    "!=": "neq",
    ">": "gt",
    "<": "lt",
    "is in": "in",
    "is not in": "not in",
    like: "like",
    "in the last": "last",
  };

  const newFilters: InternalFilter[] = [];

  let idCounter = Date.now();

  equations.forEach((equation) => {
    if (equation.items.length === 3) {
      let value = undefined;
      let values = undefined;
      if (
        equation.items[1].label === "is in" ||
        equation.items[1].label === "is not in"
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
        id: idCounter++, // Generate a unique ID for each filter
        parameter: equation.items[0].label as string,
        operator: operators[equation.items[1].label as keyof typeof operators],
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
export function defaultClearFonction(
  setFilters: React.Dispatch<React.SetStateAction<InternalFilter[]>>,
  setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  >,
) {
  setFilters([]);
  setTokenEquations([]);
}
