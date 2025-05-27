import { DashboardGroup } from "@dirac-grid/diracx-web-components/types";

// New default user sections
export const defaultSections: DashboardGroup[] = [
  {
    title: "My Gubbins Apps",
    extended: true,
    items: [
      {
        title: "Owners",
        id: "OwnerMonitor1",
        type: "Owner Monitor",
      },
      {
        title: "My Jobs",
        id: "JobMonitor1",
        type: "Job Monitor",
      },
    ],
  },
];
