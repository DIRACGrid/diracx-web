"use client";
import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";

import { Box, Typography, useTheme } from "@mui/material";
import { PieChart as MuiPieChart } from "@mui/x-charts/PieChart";
import { rainbowSurgePalette } from "@mui/x-charts/colorPalettes";

/** Height of the chart area in pixels */
const CHART_HEIGHT = 350;
/** Bottom margin reserved for the legend */
const LEGEND_MARGIN = 100;
/** Maximum number of slices before aggregating into "Other" */
const MAX_SLICES = 10;
/** Delay in ms before updating highlight state on hover */
const HIGHLIGHT_THROTTLE_MS = 50;
/** Stable series ID used to sync highlight state between chart and legend */
const SERIES_ID = "pie-series";

/** Format a number in compact notation (e.g. 1.2K, 30M) */
function formatCompact(n: number): string {
  if (n < 1000) return n.toLocaleString();
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export interface PieChartItem {
  id: string;
  value: number;
  label: string;
  color?: string;
}

interface PieChartProps {
  /** Data items to display */
  data: PieChartItem[];
  /** Called when a slice or legend item is clicked, with the item id */
  onItemClick?: (id: string) => void;
  /** Label shown below the total count in the center (e.g. "jobs", "files") */
  centerLabel?: string;
  /** Maximum number of slices before aggregating into "Other" */
  maxSlices?: number;
}

/**
 * A generic interactive donut pie chart with a custom legend.
 * - Hovering a legend item highlights the corresponding slice
 * - Clicking a legend item or slice triggers onItemClick
 */
export const PieChart = memo(function PieChart({
  data,
  onItemClick,
  centerLabel,
  maxSlices = MAX_SLICES,
}: PieChartProps) {
  const theme = useTheme();
  const defaultColors = useMemo(
    () => rainbowSurgePalette(theme.palette.mode),
    [theme.palette.mode],
  );

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up pending timer on unmount
  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  // Throttled highlight update to avoid excessive re-renders on fast mouse movement
  const setHighlightThrottled = useCallback((index: number | null) => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlightedIndex(index);
    }, HIGHLIGHT_THROTTLE_MS);
  }, []);

  // Cap slices and aggregate overflow into "Other"
  const pieData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    if (sorted.length <= maxSlices) return sorted;

    const top = sorted.slice(0, maxSlices - 1);
    const otherValue = sorted
      .slice(maxSlices - 1)
      .reduce((sum, d) => sum + d.value, 0);

    return [
      ...top,
      { id: "Other", value: otherValue, label: "Other", color: undefined },
    ];
  }, [data, maxSlices]);

  const total = useMemo(
    () => pieData.reduce((sum, d) => sum + d.value, 0),
    [pieData],
  );

  const handleLegendMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const index = Number(e.currentTarget.dataset.index);
      if (!Number.isNaN(index)) setHighlightThrottled(index);
    },
    [setHighlightThrottled],
  );

  const handleLegendMouseLeave = useCallback(() => {
    setHighlightThrottled(null);
  }, [setHighlightThrottled]);

  const handleLegendClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const id = e.currentTarget.dataset.id;
      if (id) onItemClick?.(id);
    },
    [onItemClick],
  );

  return (
    <Box sx={{ position: "relative" }}>
      <MuiPieChart
        series={[
          {
            id: SERIES_ID,
            data: pieData,
            highlightScope: { fade: "global", highlight: "item" },
            innerRadius: "55%",
            paddingAngle: 2,
            cornerRadius: 4,
          },
        ]}
        skipAnimation
        height={CHART_HEIGHT}
        margin={{ bottom: LEGEND_MARGIN }}
        highlightedItem={
          highlightedIndex !== null
            ? { seriesId: SERIES_ID, dataIndex: highlightedIndex }
            : null
        }
        onHighlightChange={(item) => {
          setHighlightThrottled(item?.dataIndex ?? null);
        }}
        onItemClick={(_event, pieItemIdentifier) => {
          const item = pieData[pieItemIdentifier.dataIndex];
          if (item) onItemClick?.(item.id);
        }}
        hideLegend
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
          {formatCompact(total)}
        </Typography>
        {centerLabel && (
          <Typography variant="caption" color="text.secondary">
            {centerLabel}
          </Typography>
        )}
      </Box>
      {/* Custom interactive legend */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1,
          px: 1,
          mt: `-${LEGEND_MARGIN - 10}px`,
          position: "relative",
        }}
      >
        {pieData.map((item, index) => (
          <Box
            key={item.id}
            data-index={index}
            data-id={item.id}
            onMouseEnter={handleLegendMouseEnter}
            onMouseLeave={handleLegendMouseLeave}
            onClick={handleLegendClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: onItemClick ? "pointer" : "default",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              opacity:
                highlightedIndex !== null && highlightedIndex !== index
                  ? 0.4
                  : 1,
              transition: "opacity 0.2s",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor:
                  item.color || defaultColors[index % defaultColors.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" noWrap>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
});
