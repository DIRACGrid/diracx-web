import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import JobMonitor from "./JobMonitor";
import UserDashboard from "./UserDashboard";

export const applicationList = [
  { name: "Dashboard", component: UserDashboard, icon: Dashboard },
  {
    name: "Job Monitor",
    component: JobMonitor,
    icon: Monitor,
  },
  {
    name: "File Catalog",
    component: JobMonitor,
    icon: FolderCopy,
  },
];
