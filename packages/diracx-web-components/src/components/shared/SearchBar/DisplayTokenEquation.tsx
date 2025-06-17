import { Button, ButtonGroup, Box } from "@mui/material";

import {
  type SearchBarTokenEquation,
  type EquationAndTokenIndex,
  EquationStatus,
} from "../../../types";

import { convertListToString } from "./Utils";

/**
 * Displays a token equation as a button group.
 *
 * @param tokensEquation The token equation to display.
 * @param handleClick Function to handle click events on tokens.
 * @param handleRightClick Function to handle right-click events.
 * @param equationIndex The index of the equation in the list.
 * @param DynamicSearchField A dynamic search field component to render when focused.
 * @param focusedTokenIndex The index of the currently focused token, if any.
 */
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
    tokensEquation.status === EquationStatus.VALID
      ? "green"
      : tokensEquation.status === EquationStatus.INVALID
        ? "red"
        : tokensEquation.status === EquationStatus.WAITING
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
