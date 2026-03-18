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
import { useJobMonitorApi } from "./JobMonitorContext";

interface JobPieChartProps {
  /** The search body used for querying */
  searchBody: SearchBody;
  /** Function to update the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
}

/**
 * Transform raw summary rows into pie chart items.
 *
 * `labelColumn` MUST be the grouping that actually produced the rows — not
 * the currently selected grouping. With SWR's keepPreviousData, the previous
 * grouping's rows stay on screen while a new grouping loads; labelling them
 * with the new column yields "undefined" labels (and duplicate item ids).
 */
export function buildPieData(
  rows: JobSummary[] | null,
  labelColumn: string,
  statusColors: Record<string, string>,
): PieChartItem[] {
  if (!rows) return [];

  return rows.map((item: JobSummary) => {
    const label = String(item[labelColumn]);
    const value = Number(item["count"]);
    return {
      id: label,
      value,
      label,
      color: statusColors[label] || undefined,
    };
  });
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
  const { columns, statusColors } = useJobMonitorApi();
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);
  const diracxUrl = useDiracxUrl();

  const [groupColumn, setGroupColumn] = useState("Status");

  // Convert the human-readable column name to the API field name
  const apiColumn = useMemo(
    () => fromHumanReadableText(groupColumn, columns),
    [groupColumn, columns],
  );

  // Fetch summary data via SWR. `dataGrouping` is the grouping that produced
  // `data` — it lags behind `apiColumn` while a new grouping is loading.
  const { data, dataGrouping, isLoading, error } = useJobSummary(
    diracxUrl,
    accessToken,
    apiColumn,
    searchBody,
  );

  // Column to label/filter the DISPLAYED rows by (may be the previous
  // grouping while revalidating).
  const labelColumn = dataGrouping ?? apiColumn;

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
  const pieData: PieChartItem[] = useMemo(
    () => buildPieData(data, labelColumn, statusColors),
    [data, labelColumn, statusColors],
  );

  // Human-readable name of the column the displayed data is grouped by:
  // clicks must filter on that column, not on the freshly selected toggle,
  // while stale rows are on screen.
  const filterColumn = useMemo(
    () =>
      columns.find((column) => String(column.id) === labelColumn)?.header ??
      groupColumn,
    [columns, labelColumn, groupColumn],
  );

  // Handle slice/legend click: add a filter
  const handleItemClick = useCallback(
    (id: string) => {
      setFilters((prev) => [
        ...prev,
        {
          parameter: String(filterColumn),
          operator: "eq",
          value: id,
        },
      ]);
    },
    [filterColumn, setFilters],
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

      {/* Chart area. The skeleton only shows on first load: while
          revalidating, SWR keeps the previous summary so the chart
          stays mounted with stale data. */}
      {isLoading && !data && (
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
      {!error && data && pieData.length === 0 && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Alert severity="info">No data available.</Alert>
        </Box>
      )}
      {!error && pieData.length > 0 && (
        <PieChart
          data={pieData}
          onItemClick={handleItemClick}
          centerLabel="jobs"
        />
      )}
    </Box>
  );
});
