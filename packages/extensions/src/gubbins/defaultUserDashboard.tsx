import { applicationList } from "@/gubbins/applicationList";

// New default user dashboard groups
export const defaultUserDashboard: {
  title: string;
  extended: boolean;
  items: {
    title: string;
    type: string;
    id: string;
    icon: React.ComponentType<{}>;
    data?: any;
  }[];
}[] = [
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
          (() => <div></div>),
      },
      {
        title: "Dashboard",
        id: "Dashboard 1",
        type: "Dashboard",
        icon:
          applicationList.find((app) => app.name === "Dashboard")?.icon ||
          (() => <div></div>),
      },
      {
        title: "Job Monitor",
        id: "Job Monitor 1",
        type: "Job Monitor",
        icon:
          applicationList.find((app) => app.name === "Job Monitor")?.icon ||
          (() => <div></div>),
      },
      {
        title: "File Catalog",
        id: "File Catalog 1",
        type: "File Catalog",
        icon:
          applicationList.find((app) => app.name === "File Catalog")?.icon ||
          (() => <div></div>),
      },
    ],
  },
];
