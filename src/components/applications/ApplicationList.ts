import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import JobMonitor from "./JobMonitor";
import UserDashboard from "./UserDashboard";

export const applicationList = [
  { name: "Dashboard", path: "/", component: UserDashboard, icon: Dashboard },
  {
    name: "Job Monitor",
    path: "/jobmonitor",
    component: JobMonitor,
    icon: Monitor,
  },
  {
    name: "File Catalog",
    path: "/filecatalog",
    component: JobMonitor,
    icon: FolderCopy,
  },
];
