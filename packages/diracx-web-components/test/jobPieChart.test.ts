import { buildPieData } from "../src/components/JobMonitor/JobPieChart";
import type { JobSummary } from "../src/types";

const siteRows: JobSummary[] = [
  { Site: "LCG.CERN.ch", count: 30 },
  { Site: "LCG.IN2P3.fr", count: 10 },
  { Site: "LCG.GRIDKA.de", count: 4 },
];

const statusRows: JobSummary[] = [{ Status: "Failed", count: 44 }];

const statusColors: Record<string, string> = { Failed: "#f44336" };

describe("buildPieData", () => {
  it("labels rows by the column that produced them", () => {
    const items = buildPieData(siteRows, "Site", statusColors);
    expect(items.map((i) => i.label)).toEqual([
      "LCG.CERN.ch",
      "LCG.IN2P3.fr",
      "LCG.GRIDKA.de",
    ]);
    // Ids double as labels and must be unique for React keys / click filters
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("never produces 'undefined' labels when the label column matches the rows", () => {
    // Regression for the keepPreviousData grouping switch: stale Site rows
    // were labeled with the freshly selected "Status" column, producing
    // several identical "undefined" legend entries (and duplicate ids).
    const stale = buildPieData(siteRows, "Status", statusColors);
    expect(stale.every((i) => i.label === "undefined")).toBe(true); // the bug

    const fixed = buildPieData(siteRows, "Site", statusColors);
    expect(fixed.some((i) => i.label === "undefined")).toBe(false); // the fix
  });

  it("applies status colors when grouped by status", () => {
    const items = buildPieData(statusRows, "Status", statusColors);
    expect(items).toEqual([
      { id: "Failed", value: 44, label: "Failed", color: "#f44336" },
    ]);
  });

  it("returns an empty list for null rows", () => {
    expect(buildPieData(null, "Status", statusColors)).toEqual([]);
  });
});
