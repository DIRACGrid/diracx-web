import { DashboardGroup } from "../types/DashboardGroup";

export const defaultDashboard: DashboardGroup[] = [
  {
    title: "My dashboard",
    extended: true,
    items: [
      {
        title: "My Jobs",
        type: "Job Monitor",
        id: "JobMonitor0",
      },
    ],
  },
];
