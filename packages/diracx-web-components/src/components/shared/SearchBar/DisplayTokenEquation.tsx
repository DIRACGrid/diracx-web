import { Box, Chip } from "@mui/material";

import {
  type SearchBarTokenEquation,
  type EquationAndTokenIndex,
  EquationStatus,
} from "../../../types";

import { convertListToString } from "./Utils";

/**
 * Displays a token equation as a tightly grouped row of chips.
 *
 * Chips within the same equation have no gap and squared inner edges
 * so they visually read as a single connected unit, while the parent
 * container's gap separates different equations.
 *
 * @param tokensEquation The token equation to display.
 * @param handleClick Function to handle click events on tokens.
 * @param handleDelete Function to handle deletion of the equation.
 * @param equationIndex The index of the equation in the list.
 * @param DynamicSearchField A dynamic search field component to render when focused.
 * @param focusedTokenIndex The index of the currently focused token, if any.
 */
export function DisplayTokenEquation({
  tokensEquation,
  handleClick,
  handleDelete,
  equationIndex,
  DynamicSearchField,
  focusedTokenIndex,
}: {
  tokensEquation: SearchBarTokenEquation;
  handleClick: (
    e: React.MouseEvent<HTMLDivElement>,
    tokenIndex: number,
  ) => void;
  handleDelete: () => void;
  equationIndex: number;
  DynamicSearchField: React.ReactNode;
  focusedTokenIndex: EquationAndTokenIndex | null;
}) {
  const tokens = tokensEquation.items;

  const chipColor =
    tokensEquation.status === EquationStatus.VALID
      ? "success"
      : tokensEquation.status === EquationStatus.INVALID
        ? "error"
        : tokensEquation.status === EquationStatus.WAITING
          ? "warning"
          : "default";

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {tokens.map((token, tokenIndex) => {
        if (
          equationIndex === focusedTokenIndex?.equationIndex &&
          tokenIndex === focusedTokenIndex.tokenIndex
        ) {
          return DynamicSearchField;
        }
        let chipLabel = token.label;
        if (typeof token.label !== "string") {
          chipLabel = convertListToString(token.label);
        }
        const isFirst = tokenIndex === 0;
        const isLast = tokenIndex === tokens.length - 1;
        return (
          <Chip
            key={tokenIndex}
            label={chipLabel}
            color={chipColor}
            size="small"
            onClick={(e) => handleClick(e, tokenIndex)}
            onDelete={isLast ? handleDelete : undefined}
            id={`tokenid:equation-${equationIndex}-token-${tokenIndex}`}
            sx={{
              // Square off the inner edges so chips look connected
              borderRadius:
                isFirst && isLast
                  ? undefined // single chip — keep default pill shape
                  : isFirst
                    ? "16px 0 0 16px"
                    : isLast
                      ? "0 16px 16px 0"
                      : 0,
            }}
          />
        );
      })}
    </Box>
  );
}
