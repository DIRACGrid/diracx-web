import { DashboardGroup } from "@dirac-grid/diracx-web-components/types";
import { BugReport } from "@mui/icons-material";
import { applicationList } from "@/gubbins/ApplicationList";

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
        icon:
          applicationList.find((app) => app.name === "Owner Monitor")?.icon ||
          BugReport,
      },
      {
        title: "My Jobs",
        id: "JobMonitor1",
        type: "Job Monitor",
        icon:
          applicationList.find((app) => app.name === "Job Monitor")?.icon ||
          BugReport,
      },
    ],
  },
];
