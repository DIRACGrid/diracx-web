import React from "react";

import { Box } from "@mui/material";

import { ColumnSelector } from "./ColumnSelector";

interface ChartViewProps {
  /** The chart to be displayed */
  chart: React.ReactElement;
  /** List of columns available for selection */
  columnList: string[];
  /** Currently selected group columns */
  groupColumns: string[];
  /** Function to set the group columns */
  setGroupColumns: React.Dispatch<React.SetStateAction<string[]>>;
  /** The current path in the chart */
  currentPath: string[];
  /** Function to set the current path in the chart */
  setCurrentPath: React.Dispatch<React.SetStateAction<string[]>>;
  /** Default group columns to be used */
  defaultColumns: string[];
  /** Optional title for the column selector */
  title?: string;
}

/**
 * Creates a component that displays a chart and allows users to select columns for grouping.
 *
 * @param props Props for the ChartViewLayout component
 * @see ChartDisplayLayoutProps
 * @returns
 */
export function ChartView({
  chart,
  columnList,
  groupColumns,
  setGroupColumns,
  currentPath,
  setCurrentPath,
  defaultColumns: defaultGroupColumns,
  title = "Level selector",
}: ChartViewProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: 1,
        paddingTop: 2,
        overflow: "auto",
        height: { xs: "auto", md: 1 },
      }}
    >
      {/* Left Section: The chart */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        {chart}
      </Box>

      {/* Right Section: Column selection */}
      <Box
        sx={{
          width: { xs: 1, md: 0.3 },
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", // Allows scrolling for filters
          alignItems: "center",
          gap: 2,
        }}
      >
        <ColumnSelector
          columnList={columnList}
          groupColumns={groupColumns}
          setGroupColumns={setGroupColumns}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          defaultColumns={defaultGroupColumns}
          title={title}
        />
      </Box>
    </Box>
  );
}
