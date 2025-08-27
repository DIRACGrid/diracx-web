import { useState, useEffect } from "react";

import {
  scaleOrdinal,
  quantize,
  interpolateRainbow,
  HierarchyRectangularNode,
} from "d3";

import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { ColumnDef } from "@tanstack/react-table";
import { useDiracxUrl } from "../../hooks/utils";

import type {
  JobSummary,
  SearchBody,
  Job,
  SunburstTree,
  Filter,
} from "../../types";
import { Sunburst } from "../shared/Sunburst";
import { useOIDCContext } from "../../hooks/oidcConfiguration";
import { ChartView } from "../shared";
import { getJobSummary } from "./jobDataService";

import { fromHumanReadableText } from "./JobMonitor";

interface JobSunburstProps {
  /** The search body to be used in the search */
  searchBody: SearchBody;
  /** The filters to be applied to the search */
  filters: Filter[];
  /** The function to update the filters */
  setFilters: React.Dispatch<React.SetStateAction<Filter[]>>;
  /** The status colors to be used in the chart */
  statusColors: Record<string, string>;
  /** The columns of the JobDataTable */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[];
}
/**
 * Create the JobSunburst component.
 *
 * @param searchBody The search body to be used in the search
 * @param statusColors The colors to be used for the different job statuses
 * @param columns The columns to be used in the table
 * @returns
 */
export function JobSunburst({
  searchBody,
  filters,
  setFilters,
  statusColors,
  columns,
}: JobSunburstProps) {
  const { configuration } = useOIDCContext();
  const { accessToken } = useOidcAccessToken(configuration?.scope);
  const diracxUrl = useDiracxUrl();

  const [groupColumns, setGroupColumns] = useState<string[]>(["Status"]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const [tree, setTree] = useState<SunburstTree | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const newSearch = currentPath.map((elt, index) => {
      return {
        parameter: fromHumanReadableText(groupColumns[index], columns),
        operator: "eq",
        value: elt,
      };
    });
    const newSearchBody: SearchBody = {
      ...searchBody,
      search: searchBody.search
        ? searchBody.search.concat(newSearch)
        : newSearch,
    };
    async function load() {
      setIsLoading(true);
      const res = await fetchAndBuildTree(
        groupColumns.slice(currentPath.length, currentPath.length + 2),
        newSearchBody,
        diracxUrl,
        accessToken,
        columns,
      );
      setTree({
        name: "",
        children: res,
      });
      setIsLoading(false);
    }
    // For optimization, only load when the used groupColumns change
    if (diracxUrl && accessToken) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columns,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    groupColumns.slice(0, currentPath.length + 2).join(", "),
    currentPath,
    searchBody,
    diracxUrl,
    accessToken,
  ]);
  // The dependencies above are not exact. For performance reasons, we don't include all dependencies.

  const defaultColors = scaleOrdinal(
    quantize(interpolateRainbow, (tree?.children?.length ?? 0) + 1),
  );

  function colorScales(name: string, _size: number, _depth: number): string {
    if (statusColors[name]) {
      return statusColors[name];
    }
    if (tree?.children) {
      return defaultColors(name);
    }
    return "#ccc";
  }

  const columnList = columns
    .filter((column) => column.meta?.isQuasiUnique !== true)
    .map((column) => String(column.header));

  const hasHiddenLevels = groupColumns.length > currentPath.length + 2;

  /**
   * Update the category filter
   * @param p The node which has to be disabled
   */
  const handleDeleteCategory = (p: HierarchyRectangularNode<SunburstTree>) => {
    const newFilters = [
      ...filters,
      {
        parameter: groupColumns[p.depth - 1],
        operator: "neq",
        value: p.data.name,
      },
    ];
    setFilters(newFilters);
  };

  const Chart = (
    <Sunburst
      tree={tree || { name: "", children: [] }}
      hasHiddenLevels={hasHiddenLevels}
      currentPath={currentPath}
      setCurrentPath={setCurrentPath}
      sizeToText={sizeToText}
      colorScales={colorScales}
      isLoading={isLoading}
      error={tree ? null : Error()}
      handleRightClick={handleDeleteCategory}
    />
  );

  return (
    <ChartView
      chart={Chart}
      columnList={columnList}
      groupColumns={groupColumns}
      setGroupColumns={setGroupColumns}
      currentPath={currentPath}
      setCurrentPath={setCurrentPath}
      defaultColumns={["Status"]}
      title={"Columns to plot"}
    />
  );
}

/**
 * Builds the tree from a given path
 *
 * @param groupColumns Array of columns to be used in the group by
 * @param searchBody The search body to be used in the search
 * @param diracxUrl The URL of the DiracX instance
 * @param accessToken The access token to be used for authentication
 * @param columns The columns to be used in the table
 * @returns
 */
export async function fetchAndBuildTree(
  groupColumns: string[],
  searchBody: SearchBody,
  diracxUrl: string | null,
  accessToken: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<Job, any>[],
): Promise<SunburstTree[]> {
  if (groupColumns.length === 0) {
    return [];
  }

  let data: JobSummary[] = [];

  const formatedGroupColumns = groupColumns.map((columnName) =>
    fromHumanReadableText(columnName, columns),
  );

  if (diracxUrl && accessToken) {
    data = await getJobSummary(
      diracxUrl,
      formatedGroupColumns,
      accessToken,
      searchBody,
    ).then((res) => res.data || []);
    return buildTree(data, formatedGroupColumns);
  }
  return [];
}

/**
 * Builds a tree for the charts
 *
 * @param data Data to be transformed into a tree
 * @param groupColumns Array of columns to be used in the group by
 * @param parentPath The path to this Data (optional)
 * @returns The tree corresponding or the sum if it's a leaf
 */
function buildTree(
  data: JobSummary[],
  groupColumns: string[],
  parentPath: string[] = [],
): SunburstTree[] {
  if (groupColumns.length === 0) return [];

  const current = groupColumns[0];

  const groupedData = data.reduce<Record<string, JobSummary[]>>((acc, item) => {
    const key: string = String(item[current]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const total = data.reduce((sum, item) => sum + Number(item["count"]), 0);
  const threshold = total * 0.05;

  const nodes: SunburstTree[] = [];
  let othersValue: SunburstTree | null = null;

  for (const key in groupedData) {
    const group = groupedData[key];
    const groupTotal = group.reduce(
      (sum, item) => sum + Number(item["count"]),
      0,
    );

    if (groupTotal < threshold) {
      // Too small group, add to "Others"
      if (othersValue === null) {
        if (groupColumns.length === 1)
          othersValue = { name: key, value: groupTotal };
        else
          othersValue = {
            name: key,
            children: buildTree(group, groupColumns.slice(1), [
              ...parentPath,
              key,
            ]),
          };
      } else if (othersValue) {
        othersValue = {
          name: "Others",
          value:
            (othersValue.children
              ? othersValue.children[0].value || 0
              : othersValue.value || 0) + groupTotal,
        };
      }
    } else {
      if (groupColumns.length === 1) {
        nodes.push({
          name: key,
          value: groupTotal,
        });
      } else {
        nodes.push({
          name: key,
          children: buildTree(group, groupColumns.slice(1), [
            ...parentPath,
            key,
          ]),
        });
      }
    }
  }

  if (othersValue) {
    nodes.push(othersValue);
  }

  return nodes;
}

/**
 *
 * @param size The number of jobs
 * @param total The total number of jobs (optional)
 * @returns A string with the number of jobs
 */
function sizeToText(size: number, total?: number): string {
  if (size > 1e9)
    return (
      `${(size / 1e9).toFixed(2)}B \njobs` +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size > 1e6)
    return (
      `${(size / 1e6).toFixed(2)}M \njobs` +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size > 1e3)
    return (
      `${(size / 1e3).toFixed(2)}k \njobs` +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size > 1)
    return (
      `${size} jobs` + (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size === 1)
    return `1 job` + (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "");
  return "";
}
