import { ReactNode } from "react";

import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";

interface PlotTypeSelectorProps<T extends string> {
  /** The type of the plot */
  plotType: T;
  /** Function to set the plot type */
  setPlotType: React.Dispatch<React.SetStateAction<T>>;
  /** List of name and JSX elements to display as buttons */
  buttonList?: { plotName: T; icon: ReactNode }[];
}

/**
 * Component to select the type of plot.
 *
 * @param plotType The type of the plot.
 * @param setPlotType The setter for the plot type.
 * @param buttonList List of buttons to select the type of plot.
 * @returns A selector for the plot type.
 */
export function PlotTypeSelector<T extends string>({
  plotType,
  setPlotType,
  buttonList = [],
}: PlotTypeSelectorProps<T>) {
  return (
    <ToggleButtonGroup
      value={plotType}
      exclusive
      onChange={(_event: React.MouseEvent, val: T) => {
        if (val !== null) setPlotType(val);
      }}
      aria-label="text alignment"
    >
      {buttonList.map((button) => (
        <Tooltip key={button.plotName} title={"Switch to this plot type"}>
          <ToggleButton value={button.plotName} aria-label={button.plotName}>
            {button.icon}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
