import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import JobMonitor from "./JobMonitor";
import UserDashboard from "./UserDashboard";
import ApplicationConfig from "@/types/ApplicationConfig";

export const applicationList: ApplicationConfig[] = [
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
