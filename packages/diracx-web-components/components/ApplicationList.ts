import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import JobMonitor from "./JobMonitor/JobMonitor";
import BaseApp from "./BaseApp/BaseApp";
import ApplicationMetadata from "@/types/ApplicationMetadata";

export const applicationList: ApplicationMetadata[] = [
  { name: "Base Application", component: BaseApp, icon: Dashboard },
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
