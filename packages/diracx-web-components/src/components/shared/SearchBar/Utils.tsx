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

/** Module-level counter backing {@link nextEquationId}. */
let equationIdCounter = 0;

/**
 * Returns a unique, stable identifier for a newly created token equation.
 * Used as a React key so that deleting/reordering equations does not
 * mis-attach component state.
 */
export function nextEquationId(): string {
  equationIdCounter += 1;
  return `equation-${equationIdCounter}`;
}

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
    tokenEquations = [
      ...tokenEquations.slice(0, -1),
      {
        ...tokenEquations[tokenEquations.length - 1],
        status: EquationStatus.WAITING,
      },
    ];
  }

  setTokenEquations([...tokenEquations]);
}

/**
 * @param tokenEquation The equation to be verified.
 * @returns The equation with its status updated based on its validity.
 */
type EquationValidator = (items: SearchBarToken[]) => EquationStatus;

const validators: Record<string, EquationValidator> = {
  [CategoryType.STRING]: (items) => {
    const freeTextOps = Operators.getFreeTextOperators().map((op) =>
      op.getDisplay(),
    );
    if (freeTextOps.includes(items[1].label as string))
      return EquationStatus.VALID;
    if (
      items[1].type === CategoryType.STRING &&
      items[2].type === CategoryType.STRING
    )
      return EquationStatus.VALID;
    return EquationStatus.INVALID;
  },

  [CategoryType.NUMBER]: (items) => {
    if (
      items[1].type !== CategoryType.NUMBER ||
      items[2].type !== CategoryType.NUMBER
    )
      return EquationStatus.INVALID;
    const label = items[2].label;
    const values = typeof label === "string" ? [label] : label;
    return values.every((v) => !isNaN(Number(v)))
      ? EquationStatus.VALID
      : EquationStatus.INVALID;
  },

  [CategoryType.BOOLEAN]: (items) => {
    if (items[1].type !== CategoryType.BOOLEAN) return EquationStatus.INVALID;
    return items[2].label === "true" || items[2].label === "false"
      ? EquationStatus.VALID
      : EquationStatus.INVALID;
  },

  [CategoryType.DATE]: (items) => {
    if (items[1].type !== CategoryType.DATE) return EquationStatus.INVALID;

    if (
      (items[1].label === Operators.GREATER_THAN.getDisplay() ||
        items[1].label === Operators.LESS_THAN.getDisplay()) &&
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(items[2].label as string)
    ) {
      return EquationStatus.VALID;
    }

    if (
      items[1].label === Operators.LAST.getDisplay() &&
      typeof items[2].label === "string"
    ) {
      return validateLastDuration(items[2].label);
    }

    return EquationStatus.INVALID;
  },
};

/**
 * Upper bound (in years) accepted for a "last N <unit>" duration.
 * Durations at or above this are rejected as nonsensical. The value is a
 * sanity cap, not a calendar year (it predates any date arithmetic);
 * preserved from the previous hardcoded literal.
 */
const MAX_LAST_DURATION_YEARS = 2025;

function validateLastDuration(label: string): EquationStatus {
  const pattern =
    /^(minute|hour|day|week|month|year)$|^(\d+)\s+(minutes|hours|days|weeks|months|years)$/;
  const match = label.match(pattern);
  if (!match) return EquationStatus.INVALID;

  if (match[1]) return EquationStatus.VALID;

  const yearsEquivalent = convertToYears(parseInt(match[2], 10), match[3]);
  return yearsEquivalent < MAX_LAST_DURATION_YEARS
    ? EquationStatus.VALID
    : EquationStatus.INVALID;
}

function convertToYears(quantity: number, unit: string): number {
  const conversions: Record<string, number> = {
    minutes: 1 / (60 * 24 * 365),
    hours: 1 / (24 * 365),
    days: 1 / 365,
    weeks: 1 / 52,
    months: 1 / 12,
    years: 1,
  };
  return quantity * (conversions[unit] ?? 0);
}

function handleEquationVerification(
  inputEquation: SearchBarTokenEquation,
): SearchBarTokenEquation {
  const equation = {
    ...inputEquation,
    items: [...inputEquation.items],
  };

  // Sometimes, an equation can be a single token, e.g., a keyword
  if (equation.items.length === 1) {
    equation.status =
      equation.items[0].nature === SearchBarTokenNature.CUSTOM
        ? EquationStatus.VALID
        : EquationStatus.INVALID;
    return equation;
  }

  if (equation.items.length !== 3) {
    equation.status = EquationStatus.INVALID;
    return equation;
  }

  // Check the structure of the equation
  if (
    equation.items[0].nature !== SearchBarTokenNature.CATEGORY ||
    equation.items[1].nature !== SearchBarTokenNature.OPERATOR ||
    equation.items[2].nature !== SearchBarTokenNature.VALUE
  ) {
    equation.status = EquationStatus.INVALID;
    return equation;
  }

  // When the equations are built from storage, the types are not set yet
  if (equation.items[2].type === CategoryType.UNKNOWN) {
    equation.status = EquationStatus.VALID;
    return equation;
  }

  // Delegate to type-specific validator
  const validator = validators[equation.items[0].type];
  equation.status = validator
    ? validator(equation.items)
    : EquationStatus.INVALID;

  return equation;
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
    if (!previousEquation) {
      return { previousEquation: undefined, previousToken: undefined };
    }
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

  // Operators form a static vocabulary: classify them without relying on the
  // suggestions state, which is updated by a debounced async effect and may
  // still hold the previous token's suggestion list when the user types
  // quickly (e.g. "={enter}" right after completing a category token).
  if (lastToken?.nature === SearchBarTokenNature.CATEGORY) {
    const operatorsForType =
      {
        [CategoryType.STRING]: Operators.getStringOperators(),
        [CategoryType.NUMBER]: Operators.getNumberOperators(),
        [CategoryType.BOOLEAN]: Operators.getBooleanOperators(),
        [CategoryType.DATE]: Operators.getDateOperators(),
      }[String(lastToken.type)] ?? Operators.getDefaultOperators();
    if (operatorsForType.map((op) => op.getDisplay()).includes(value)) {
      return {
        nature: SearchBarTokenNature.OPERATOR,
        type: lastToken.type ?? CategoryType.CUSTOM,
      };
    }
  }

  // Same rationale for the value slot: if the suggestions in state still
  // belong to the operator slot (their nature says OPERATOR), they cannot
  // validate a value — accept the input as a value instead of dropping it
  // as CUSTOM. Loaded value-slot suggestions always carry the VALUE nature,
  // so the strict "value must come from the list" behavior is preserved
  // once the debounced suggestions effect has caught up.
  if (
    lastToken?.nature === SearchBarTokenNature.OPERATOR &&
    suggestions.nature.includes(SearchBarTokenNature.OPERATOR)
  ) {
    return {
      nature: SearchBarTokenNature.VALUE,
      type: lastToken.type ?? CategoryType.CUSTOM,
    };
  }

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
    // After an operator the input IS the equation's value, even when it is not
    // among the loaded value suggestions (e.g. a JobID like "1" that no current
    // job has). Value-slot suggestions are hints, not a closed vocabulary, so
    // classify free input as VALUE rather than CUSTOM. Returning CUSTOM here
    // makes a filter-only search bar (allowKeyWordSearch=false) silently drop
    // the value token, and makes the equation fail the [CATEGORY, OPERATOR,
    // VALUE] shape check even when keyword search is allowed.
    return {
      nature: SearchBarTokenNature.VALUE,
      type: lastToken?.type || CategoryType.CUSTOM,
    };
  }
  // No category/operator context: this is a free keyword (first token).
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
    id: nextEquationId(),
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
    ] || CategoryType.UNKNOWN;

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
    ] || CategoryType.UNKNOWN;

  newEquation.items[1].suggestions = suggestions_operators;
  // Value suggestions are deliberately NOT fetched here: for backends they
  // require an expensive group-by query per filter, and they are only needed
  // once the user focuses/clicks the value token — at which point
  // useSearchSuggestions fetches fresh ones. Token display does not use them.
  newEquation.items[2].suggestions = { items: [], nature: [], type: [] };

  return newEquation;
}
