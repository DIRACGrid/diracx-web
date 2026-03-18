"use client";
import { useState, useCallback, useMemo, memo } from "react";

import { useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Box,
  Alert,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import { useDiracxUrl } from "../../hooks/utils";
import type { SearchBody, Filter, JobSummary } from "../../types";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { PieChart, PieChartItem } from "../shared/PieChart";
import { useJobSummary } from "./jobDataService";
import { fromHumanReadableText } from "./jobColumns";
import { useJobMonitorContext } from "./JobMonitorContext";

interface JobPieChartProps {
  /** The search body used for querying */
  searchBody: SearchBody;
  /** Function to update the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}

/**
 * A pie chart component for the Job Monitor.
 * Shows job distribution grouped by a selectable column.
 * Clicking a slice or legend item adds a filter to the search bar.
 */
export const JobPieChart = memo(function JobPieChart({
  searchBody,
  setFilters,
}: JobPieChartProps) {
  const { columns, statusColors } = useJobMonitorContext();
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);
  const diracxUrl = useDiracxUrl();

  const [groupColumn, setGroupColumn] = useState("Status");

  // Convert the human-readable column name to the API field name
  const apiColumn = useMemo(
    () => fromHumanReadableText(groupColumn, columns),
    [groupColumn, columns],
  );

  // Fetch summary data via SWR
  const { data, isLoading, error } = useJobSummary(
    diracxUrl,
    accessToken,
    apiColumn,
    searchBody,
  );

  // Columns available for grouping (exclude quasi-unique like JobID, dates)
  const groupableColumns = useMemo(
    () =>
      columns
        .filter((column) => column.meta?.isQuasiUnique !== true)
        .map((column) => ({
          id: String(column.id),
          header: String(column.header),
        })),
    [columns],
  );

  // Transform raw summary data into pie chart format
  const pieData: PieChartItem[] = useMemo(() => {
    if (!data) return [];

    return data.map((item: JobSummary) => {
      const label = String(item[apiColumn as keyof JobSummary]);
      const value = Number(item["count"]);
      return {
        id: label,
        value,
        label,
        color: statusColors[label] || undefined,
      };
    });
  }, [data, apiColumn, statusColors]);

  // Handle slice/legend click: add a filter
  const handleItemClick = useCallback(
    (id: string) => {
      setFilters((prev) => [
        ...prev,
        {
          parameter: groupColumn,
          operator: "eq",
          value: id,
        },
      ]);
    },
    [groupColumn, setFilters],
  );

  const handleGroupChange = (
    _event: React.MouseEvent<HTMLElement>,
    newGroup: string | null,
  ) => {
    if (newGroup !== null) {
      setGroupColumn(newGroup);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
        p: 1.5,
      }}
      data-testid="job-pie-chart"
    >
      {/* Group-by toggle */}
      <ToggleButtonGroup
        value={groupColumn}
        exclusive
        onChange={handleGroupChange}
        size="small"
        sx={{
          flexWrap: "wrap",
          gap: 0.5,
          "& .MuiToggleButton-root": {
            textTransform: "none",
            px: 1.5,
            py: 0.25,
            fontSize: "0.75rem",
            borderRadius: "16px !important",
            border: "1px solid",
            borderColor: "divider",
          },
        }}
        data-testid="group-selector"
      >
        {groupableColumns.map((col) => (
          <ToggleButton key={col.header} value={col.header}>
            {col.header}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Chart area */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Skeleton
            variant="circular"
            animation="pulse"
            width={200}
            height={200}
          />
        </Box>
      )}
      {!isLoading && error && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Alert severity="error">Failed to load chart data.</Alert>
        </Box>
      )}
      {!isLoading && !error && pieData.length === 0 && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Alert severity="info">No data available.</Alert>
        </Box>
      )}
      {!isLoading && !error && pieData.length > 0 && (
        <PieChart
          data={pieData}
          onItemClick={handleItemClick}
          centerLabel="jobs"
        />
      )}
    </Box>
  );
});
