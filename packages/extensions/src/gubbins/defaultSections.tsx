import { applicationList } from "@/gubbins/applicationList";
import { UserSection } from "@dirac-grid/diracx-web-components/types";
import { BugReport } from "@mui/icons-material";

// New default user sections
export const defaultSections: UserSection[] = [
  {
    title: "Default Applications",
    extended: true,
    items: [
      {
        title: "Test App",
        id: "Test App 1",
        type: "Test App",
        icon:
          applicationList.find((app) => app.name === "Test App")?.icon ||
          BugReport,
      },
      {
        title: "Dashboard",
        id: "Dashboard 1",
        type: "Dashboard",
        icon:
          applicationList.find((app) => app.name === "Dashboard")?.icon ||
          BugReport,
      },
      {
        title: "Job Monitor",
        id: "Job Monitor 1",
        type: "Job Monitor",
        icon:
          applicationList.find((app) => app.name === "Job Monitor")?.icon ||
          BugReport,
      },
      {
        title: "File Catalog",
        id: "File Catalog 1",
        type: "File Catalog",
        icon:
          applicationList.find((app) => app.name === "File Catalog")?.icon ||
          BugReport,
      },
    ],
  },
];
