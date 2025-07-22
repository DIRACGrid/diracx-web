import {
  SearchBarTokenEquation,
  SearchBarToken,
  Filter,
  SearchBarSuggestions,
  EquationAndTokenIndex,
  CategoryType,
  SearchBarTokenNature,
  EquationStatus,
  Operators,
} from "../../../types";

import { CreateSuggestionsParams } from "./SearchBar";

/**
 * @param tokenEquations The list of token equations to be verified.
 * @param setTokenEquations A function to update the state of token equations.
 * This function verifies the validity of each equation and updates their status.
 */
export function handleEquationsVerification(
  tokenEquations: SearchBarTokenEquation[],
  setTokenEquations: React.Dispatch<
    React.SetStateAction<SearchBarTokenEquation[]>
  >,
) {
  tokenEquations = tokenEquations.map(handleEquationVerification);

  if (
    tokenEquations.length > 0 &&
    tokenEquations[tokenEquations.length - 1].status ===
      EquationStatus.INVALID &&
    tokenEquations[tokenEquations.length - 1].items.length < 3
  ) {
    tokenEquations[tokenEquations.length - 1].status = EquationStatus.WAITING;
  }

  setTokenEquations([...tokenEquations]);
}

/**
 * @param tokenEquation The equation to be verified.
 * @returns The equation with its status updated based on its validity.
 */
function handleEquationVerification(
  tokenEquation: SearchBarTokenEquation,
): SearchBarTokenEquation {
  const freeTextOperators = Operators.getFreeTextOperators().map((operator) =>
    operator.getDisplay(),
  );

  // Sometimes, an equation can be a single token, e.g., a keyword
  if (tokenEquation.items.length === 1) {
    tokenEquation.status =
      tokenEquation.items[0].nature === SearchBarTokenNature.CUSTOM
        ? EquationStatus.VALID
        : EquationStatus.INVALID;
    return tokenEquation;
  }

  if (tokenEquation.items.length !== 3) {
    tokenEquation.status = EquationStatus.INVALID;
    return tokenEquation;
  }

  // Check the structure of the equation
  if (
    tokenEquation.items[0].nature !== SearchBarTokenNature.CATEGORY ||
    tokenEquation.items[1].nature !== SearchBarTokenNature.OPERATOR ||
    tokenEquation.items[2].nature !== SearchBarTokenNature.VALUE
  ) {
    tokenEquation.status = EquationStatus.INVALID;
    return tokenEquation;
  }

  // When the equation are build from the storage, the types are not set yet
  if (tokenEquation.items[2].type === CategoryType.UNKNOWN) {
    tokenEquation.status = EquationStatus.VALID;
    return tokenEquation;
  }

  // For a normal equation, we check is consistency based on the type of the first token
  switch (tokenEquation.items[0].type) {
    case CategoryType.STRING:
      if (
        freeTextOperators.includes(tokenEquation.items[1].label as string) ||
        (tokenEquation.items[1].type === CategoryType.STRING &&
          tokenEquation.items[2].type === CategoryType.STRING)
      )
        tokenEquation.status = EquationStatus.VALID;
      else tokenEquation.status = EquationStatus.INVALID;
      break;

    case CategoryType.NUMBER:
      if (
        tokenEquation.items[1].type === CategoryType.NUMBER &&
        tokenEquation.items[2].type === CategoryType.NUMBER &&
        (typeof tokenEquation.items[2].label === "string"
          ? !isNaN(Number(tokenEquation.items[2].label))
          : tokenEquation.items[2].label.every((item) => !isNaN(Number(item))))
      )
        tokenEquation.status = EquationStatus.VALID;
      else tokenEquation.status = EquationStatus.INVALID;
      break;

    case CategoryType.BOOLEAN:
      if (
        tokenEquation.items[1].type === CategoryType.BOOLEAN &&
        (tokenEquation.items[2].label === "true" ||
          tokenEquation.items[2].label === "false")
      )
        tokenEquation.status = EquationStatus.VALID;
      else tokenEquation.status = EquationStatus.INVALID;
      break;

    case CategoryType.DATE:
      if (
        tokenEquation.items[1].type === CategoryType.DATE &&
        (tokenEquation.items[1].label === Operators.GREATER_THAN.getDisplay() ||
          tokenEquation.items[1].label === Operators.LESS_THAN.getDisplay()) &&
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(
          tokenEquation.items[2].label as string,
        )
      )
        tokenEquation.status = EquationStatus.VALID;
      else if (
        tokenEquation.items[1].label === Operators.LAST.getDisplay() &&
        typeof tokenEquation.items[2].label == "string"
      ) {
        const pattern =
          /^(minute|hour|day|week|month|year)$|^(\d+)\s+(minutes|hours|days|weeks|months|years)$/;

        const match = tokenEquation.items[2].label.match(pattern);
        if (!match) {
          tokenEquation.status = EquationStatus.INVALID;
          return tokenEquation;
        }

        if (match[1]) tokenEquation.status = EquationStatus.VALID;
        else {
          const quantity = parseInt(match[2], 10);
          const unit = match[3];
          const years = (() => {
            switch (unit) {
              case "minutes":
                return quantity / (60 * 24 * 365);
              case "hours":
                return quantity / (24 * 365);
              case "days":
                return quantity / 365;
              case "weeks":
                return quantity / 52;
              case "months":
                return quantity / 12;
              case "years":
                return quantity;
              default:
                return 0;
            }
          })();
          tokenEquation.status =
            years < 2025 ? EquationStatus.VALID : EquationStatus.INVALID;
        }
      }
  }

  return tokenEquation;
}

/**
 *
 * @param focusedTokenIndex The index of the focused token, or null if no token is focused.
 * The structure is { equationIndex: number, tokenIndex: number }.
 * @param tokenEquations The list of token equations.
 * @returns An object containing the index of the previous equation and the index of the previous token.
 */
export function getPreviousEquationAndToken(
  focusedTokenIndex: EquationAndTokenIndex | null,
  tokenEquations: SearchBarTokenEquation[],
) {
  if (focusedTokenIndex) {
    if (focusedTokenIndex.tokenIndex > 0) {
      const previousEquation: SearchBarTokenEquation | undefined =
        tokenEquations[focusedTokenIndex.equationIndex];
      const previousToken =
        previousEquation?.items[focusedTokenIndex.tokenIndex - 1];
      return { previousEquation, previousToken };
    }
    if (
      focusedTokenIndex.equationIndex === 0 &&
      focusedTokenIndex.tokenIndex === 0
    ) {
      return { previousEquation: undefined, previousToken: undefined };
    }
    // else
    const previousEquation =
      tokenEquations[focusedTokenIndex.equationIndex - 1] || undefined;
    const previousToken =
      previousEquation.items[previousEquation.items.length - 1] || undefined;
    return { previousEquation, previousToken };
  }
  // else
  const lastEquation =
    tokenEquations.length > 0
      ? tokenEquations[tokenEquations.length - 1]
      : undefined;
  const lastToken = lastEquation?.items[lastEquation.items.length - 1];

  return { previousEquation: lastEquation, previousToken: lastToken };
}

/**
 * Returns the type of a token based on the previous token and equation.
 * @param value The value of the token to be checked.
 * @param suggestions The suggestions object containing items and their types.
 * @param lastToken The last token in the equation, which can be undefined
 * @returns The type of the token and its nature.
 */
export function getTokenMetadata(
  value: string,
  suggestions: SearchBarSuggestions,
  lastToken: SearchBarToken | undefined,
): {
  nature: SearchBarTokenNature;
  type: CategoryType;
} {
  // The value can be for a is in/is not in
  const values = value.split(/,|\|/).map((v) => v.trim());

  // If the value is in the suggestions list, return its metadata
  // If there is no suggestions for this category, then we allow every input
  // If the last token is an free text operator

  const index = suggestions.items.indexOf(value);
  const isFreeTextOperator = Operators.getFreeTextOperators()
    .map((op) => op.getDisplay())
    .includes(String(lastToken?.label));
  if (index >= 0 || suggestions.items.length === 0 || isFreeTextOperator) {
    return {
      nature: suggestions.nature[index] ?? SearchBarTokenNature.VALUE,
      type: suggestions.type[index] ?? lastToken?.type ?? CategoryType.CUSTOM,
    };
  }

  // Special case for the "is in" and "is not in" operators. We need to split the value to check each part.
  if (
    lastToken &&
    lastToken.nature === SearchBarTokenNature.OPERATOR &&
    (lastToken.label === Operators.IN.getDisplay() ||
      lastToken.label === Operators.NOT_IN.getDisplay())
  ) {
    if (values.every((value) => suggestions.items.includes(value)))
      return {
        nature: SearchBarTokenNature.VALUE,
        type: lastToken?.type || CategoryType.CUSTOM,
      };

    return {
      nature: SearchBarTokenNature.CUSTOM,
      type: lastToken?.type || CategoryType.CUSTOM,
    };
  }

  if (lastToken && lastToken.nature === SearchBarTokenNature.OPERATOR) {
    // If the last token is an operator, the user wrote a custom value
    return {
      nature: SearchBarTokenNature.CUSTOM,
      type: lastToken?.type || CategoryType.CUSTOM,
    };
  }
  return {
    nature: SearchBarTokenNature.CUSTOM,
    type: lastToken?.type || CategoryType.CUSTOM,
  };
}

/**
 *
 * @param labelList The list of labels to be converted to a string.
 * @returns A string representation of the label list, with each label separated by " | ".
 */
export function convertListToString(labelList: string[] | string): string {
  if (Array.isArray(labelList)) {
    return labelList
      .reduce((acc, label) => acc + label + " | ", "")
      .slice(0, -3); // Remove the last " | "
  }
  return labelList;
}

/**
 * This function converts a filter object into a SearchBarTokenEquation.
 *
 * @param filter The filter object containing the parameter, operator, and value(s).
 * @param filterIndex The index of the filter in the list of filters.
 * @param createSuggestions The function to create suggestions based on the previous token and equation.
 * @returns A promise that resolves to a SearchBarTokenEquation object representing the filter.
 */
export async function convertFilterToTokenEquation(
  filter: Filter,
  filterIndex: number,
  createSuggestions: ({
    previousToken,
    previousEquation,
    equationIndex,
  }: CreateSuggestionsParams) => Promise<SearchBarSuggestions>,
): Promise<SearchBarTokenEquation> {
  const newEquation: SearchBarTokenEquation = {
    items: [
      {
        label: filter.parameter,
        nature: SearchBarTokenNature.CATEGORY,
        type: CategoryType.UNKNOWN,
      },
      {
        label: Operators.getDisplayFromInternal(filter.operator),
        nature: SearchBarTokenNature.OPERATOR,
        type: CategoryType.UNKNOWN,
      },
      {
        label: filter.value || filter.values || "",
        nature: SearchBarTokenNature.VALUE,
        type: CategoryType.UNKNOWN,
      },
    ],
    status: EquationStatus.VALID,
  };

  // For the category
  const suggestions_categories = await createSuggestions({
    equationIndex: filterIndex,
  });

  newEquation.items[0].type =
    suggestions_categories.type[
      suggestions_categories.items.indexOf(filter.parameter)
    ] || SearchBarTokenNature.CATEGORY;

  // For the operator
  const suggestions_operators = await createSuggestions({
    previousToken: newEquation.items[0],
    previousEquation: newEquation,
    equationIndex: filterIndex,
  });

  newEquation.items[1].type =
    suggestions_operators.type[
      suggestions_operators.items.indexOf(
        Operators.getDisplayFromInternal(filter.operator),
      )
    ] || SearchBarTokenNature.OPERATOR;

  // For the value
  const suggestions_values = await createSuggestions({
    previousToken: newEquation.items[1],
    previousEquation: newEquation,
    equationIndex: filterIndex,
  });

  newEquation.items[1].suggestions = suggestions_operators;
  newEquation.items[2].suggestions = suggestions_values;

  return newEquation;
}
