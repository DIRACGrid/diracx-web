import { Button, ButtonGroup, Box } from "@mui/material";

import type {
  SearchBarTokenEquation,
  SearchBarToken,
  InternalFilter,
  SearchBarSuggestions,
} from "../../../types";

import type { EquationAndTokenIndex } from "./Types";

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
    tokenEquations[tokenEquations.length - 1].status === "invalid" &&
    tokenEquations[tokenEquations.length - 1].items.length < 3
  ) {
    tokenEquations[tokenEquations.length - 1].status = "waiting";
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
  const freeTextOperators = [
    "like",
    "not like",
    "is in",
    "is not in",
    "in the last",
    "<",
    "<=",
  ];

  if (tokenEquation.items.length === 1) {
    tokenEquation.status =
      tokenEquation.items[0].type === "custom" ? "valid" : "invalid";
    return tokenEquation;
  }

  if (tokenEquation.items.length !== 3) {
    tokenEquation.status = "invalid";
    return tokenEquation;
  }

  switch (tokenEquation.items[0].type) {
    case "category_string":
      if (
        freeTextOperators.includes(tokenEquation.items[1].label as string) ||
        (tokenEquation.items[1].type === "operator_string" &&
          tokenEquation.items[2].type === "value")
      )
        tokenEquation.status = "valid";
      else tokenEquation.status = "invalid";
      break;

    case "category_number":
      if (
        freeTextOperators.includes(tokenEquation.items[1].label as string) ||
        (tokenEquation.items[1].type === "operator_number" &&
          !Number.isNaN(Number(tokenEquation.items[2].label)))
      )
        tokenEquation.status = "valid";
      else tokenEquation.status = "invalid";
      break;

    case "category_boolean":
      if (
        tokenEquation.items[1].type === "operator_bool" &&
        (tokenEquation.items[2].label === "true" ||
          tokenEquation.items[2].label === "false")
      )
        tokenEquation.status = "valid";
      else tokenEquation.status = "invalid";
      break;

    case "category_date":
      if (
        tokenEquation.items[1].type === "operator_date" &&
        (tokenEquation.items[1].label === ">" ||
          tokenEquation.items[1].label === "<") &&
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(
          tokenEquation.items[2].label as string,
        )
      )
        tokenEquation.status = "valid";
      else if (
        tokenEquation.items[1].label === "in the last" &&
        typeof tokenEquation.items[2].label == "string"
      ) {
        const pattern =
          /^(minute|hour|day|week|month|year)$|^(\d+)\s+(minutes|hours|days|weeks|months|years)$/;

        const match = tokenEquation.items[2].label.match(pattern);
        if (!match) {
          tokenEquation.status = "invalid";
          return tokenEquation;
        }

        if (match[1]) tokenEquation.status = "valid";
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
          tokenEquation.status = years < 2025 ? "valid" : "invalid";
        }
      }
  }

  return tokenEquation;
}

/**
 *
 * @param focusedTokenIndex The index of the focused token, or null if no token is focused.
 * @param tokenEquations The list of token equations.
 * @returns An object containing the index of the previous equation and the index of the previous token.
 */
export function getPreviousEquationAndToken(
  focusedTokenIndex: EquationAndTokenIndex | null,
  tokenEquations: SearchBarTokenEquation[],
) {
  if (focusedTokenIndex) {
    if (focusedTokenIndex.tokenIndex > 0) {
      const previousEquation = tokenEquations[focusedTokenIndex.equationIndex];
      const previousToken =
        previousEquation.items[focusedTokenIndex.tokenIndex - 1];
      return { previousEquation, previousToken };
    }
    if (
      focusedTokenIndex.equationIndex === 0 &&
      focusedTokenIndex.tokenIndex === 0
    ) {
      return { previousEquation: undefined, previousToken: undefined };
    }
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

export function DisplayTokenEquation({
  tokensEquation,
  handleClick,
  handleRightClick,
  equationIndex,
  DynamicSearchField,
  focusedTokenIndex,
}: {
  tokensEquation: SearchBarTokenEquation;
  handleClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    tokenIndex: number,
  ) => void;
  handleRightClick: () => void;
  equationIndex: number;
  DynamicSearchField: React.ReactNode;
  focusedTokenIndex: EquationAndTokenIndex | null;
}) {
  const tokens = tokensEquation.items;

  const buttonColor =
    tokensEquation.status === "valid"
      ? "green"
      : tokensEquation.status === "invalid"
        ? "red"
        : tokensEquation.status === "waiting"
          ? "orange"
          : "grey";

  return (
    <Box>
      <ButtonGroup
        variant="outlined"
        sx={{
          "& .MuiButtonGroup-grouped": {
            borderColor: buttonColor,
          },
        }}
      >
        {tokens.map((token, tokenIndex) => {
          if (
            equationIndex === focusedTokenIndex?.equationIndex &&
            tokenIndex === focusedTokenIndex.tokenIndex
          ) {
            return DynamicSearchField;
          }
          let buttonLabel = token.label;
          if (typeof token.label !== "string") {
            buttonLabel = convertListToString(token.label);
          }
          return (
            <Button
              sx={{
                color: buttonColor,
              }}
              key={tokenIndex}
              onClick={(e) => handleClick(e, tokenIndex)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleRightClick();
              }}
            >
              {buttonLabel}
            </Button>
          );
        })}
      </ButtonGroup>
    </Box>
  );
}

/**
 * Returns the type of a token based on the previous token and equation.
 * @returns The type of the token, which can be "custom", "value", "operator", "custom_value", or a category type.
 */
export function getTokenType(
  value: string,
  suggestions: SearchBarSuggestions,
  lastToken: SearchBarToken | undefined,
): string {
  if (suggestions.items.includes(value)) {
    const index = suggestions.items.indexOf(value);
    return suggestions.type[index];
  }
  if (lastToken && lastToken.type.startsWith("operator")) {
    // If the last token is an operator, we assume the current token is a value
    return "custom_value";
  }
  return "custom";
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
 * Creates token equations from a filter object
 *
 * @param filter The filter to be converted to a token equation.
 * @param createSuggestions The function to create suggestions based on the previous token and equation.
 * @returns The token equations representing the filter
 */
export async function convertFilterToTokenEquation(
  filter: InternalFilter,
  createSuggestions: (
    previousToken: SearchBarToken | undefined,
    previousEquation: SearchBarTokenEquation | undefined,
  ) => Promise<SearchBarSuggestions>,
): Promise<SearchBarTokenEquation> {
  const operators = {
    eq: "=",
    neq: "!=",
    gt: ">",
    lt: "<",
    in: "is in",
    "not in": "is not in",
    like: "like",
    last: "in the last",
  };

  const newEquation: SearchBarTokenEquation = {
    items: [
      { label: filter.parameter, type: "category" },
      {
        label: operators[filter.operator as keyof typeof operators],
        type: "operator",
      },
      { label: filter.value || filter.values || "", type: "value" },
    ],
    status: "valid",
  };

  const suggestions_cat = await createSuggestions(undefined, undefined);

  newEquation.items[0].type =
    suggestions_cat.type[suggestions_cat.items.indexOf(filter.parameter)] ||
    "category";

  const suggestions_op = await createSuggestions(
    newEquation.items[0],
    newEquation,
  );

  newEquation.items[1].type =
    suggestions_op.type[
      suggestions_op.items.indexOf(
        operators[filter.operator as keyof typeof operators],
      )
    ] || "operator";

  const suggestions_value = await createSuggestions(
    newEquation.items[1],
    newEquation,
  );

  newEquation.items[1].suggestions = suggestions_op;
  newEquation.items[2].suggestions = suggestions_value;

  return newEquation;
}
