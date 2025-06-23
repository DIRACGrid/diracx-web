import React from "react";

import { Box } from "@mui/material";

import { ColumnSelector } from "./ColumnSelector";

interface ChartDisplayLayoutProps {
  /** The chart to be displayed */
  Chart: JSX.Element;
  /** List of columns available for selection */
  columnList: string[];
  /** Currently selected group columns */
  groupColumns: string[];
  /** Function to set the group columns */
  setGroupColumns: React.Dispatch<React.SetStateAction<string[]>>;
  /** Function to set the current path in the chart */
  setCurrentPath: React.Dispatch<React.SetStateAction<string[]>>;
  /** Default group columns to be used */
  defaultColumns: string[];
  /** Optional title for the column selector */
  title?: string;
}

/**
 * Creates a layout for displaying a chart alongside a column selector.
 *
 * @param props Props for the ChartDisplayLayout component
 * @see ChartDisplayLayoutProps
 * @returns
 */
export function ChartDisplayLayout({
  Chart,
  columnList,
  groupColumns,
  setGroupColumns,
  setCurrentPath,
  defaultColumns: defaultGroupColumns,
  title = "Level selector",
}: ChartDisplayLayoutProps) {
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
        {Chart}
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
          setCurrentPath={setCurrentPath}
          defaultColumns={defaultGroupColumns}
          title={title}
        />
      </Box>
    </Box>
  );
}
