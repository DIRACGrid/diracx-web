"use client";
import { useState, useCallback, useMemo } from "react";

import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { ColumnDef } from "@tanstack/react-table";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

import { useDiracxUrl } from "../../hooks/utils";
import type { SearchBody, Job, Filter, JobSummary } from "../../types";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { useJobSummary } from "./jobDataService";
import { fromHumanReadableText } from "./JobMonitor";

/** Height of the chart area in pixels */
const CHART_HEIGHT = 350;
/** Bottom margin reserved for the legend */
const LEGEND_MARGIN = 100;
/** Maximum number of slices before aggregating into "Other" */
const MAX_SLICES = 10;

/** Format a number in compact notation (e.g. 1.2K, 30M) */
function formatCompact(n: number): string {
  if (n < 1000) return n.toLocaleString();
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

interface JobPieChartProps {
  /** The search body used for querying */
  searchBody: SearchBody;
  /** Function to update the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** Status color mapping */
  statusColors: Record<string, string>;
  /** Column definitions from the table */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[];
}

/**
 * A pie chart component for the Job Monitor.
 * Shows job distribution grouped by a selectable column.
 * Clicking a slice adds a filter to the search bar.
 */
export function JobPieChart({
  searchBody,
  setFilters,
  statusColors,
  columns,
}: JobPieChartProps) {
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

  // Transform raw summary data into pie chart format, capping at MAX_SLICES
  const pieData = useMemo(() => {
    if (!data) return [];

    const all = data
      .map((item: JobSummary) => {
        const label = String(item[apiColumn as keyof JobSummary]);
        const value = Number(item["count"]);
        return {
          id: label,
          value,
          label,
          color: statusColors[label] || undefined,
        };
      })
      .sort((a, b) => b.value - a.value);

    if (all.length <= MAX_SLICES) return all;

    const top = all.slice(0, MAX_SLICES - 1);
    const otherValue = all
      .slice(MAX_SLICES - 1)
      .reduce((sum, d) => sum + d.value, 0);

    return [
      ...top,
      { id: "Other", value: otherValue, label: "Other", color: undefined },
    ];
  }, [data, apiColumn, statusColors]);

  // Total job count for center label
  const totalJobs = useMemo(
    () => pieData.reduce((sum, d) => sum + d.value, 0),
    [pieData],
  );

  // Handle slice click: add a filter
  const handleSliceClick = useCallback(
    (_event: React.MouseEvent, sliceIndex: number) => {
      if (sliceIndex >= pieData.length) return;

      const sliceId = pieData[sliceIndex].id;

      setFilters((prev) => [
        ...prev,
        {
          parameter: groupColumn,
          operator: "eq",
          value: sliceId,
        },
      ]);
    },
    [groupColumn, pieData, setFilters],
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
          <CircularProgress />
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
        <Box sx={{ position: "relative" }}>
          <PieChart
            series={[
              {
                data: pieData,
                highlightScope: { fade: "global", highlight: "item" },
                innerRadius: "55%",
                paddingAngle: 2,
                cornerRadius: 4,
              },
            ]}
            height={CHART_HEIGHT}
            margin={{ bottom: LEGEND_MARGIN }}
            onItemClick={(_event, pieItemIdentifier) => {
              handleSliceClick(
                _event as unknown as React.MouseEvent,
                pieItemIdentifier.dataIndex,
              );
            }}
            slotProps={{
              legend: {
                direction: "horizontal",
                position: { vertical: "bottom", horizontal: "center" },
              },
            }}
          />
          {/* Total count in the center of the donut */}
          <Box
            sx={{
              position: "absolute",
              top: (CHART_HEIGHT - LEGEND_MARGIN) / 2,
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {formatCompact(totalJobs)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              jobs
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
