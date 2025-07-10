"use client";

import { FolderCopy, Monitor } from "@mui/icons-material";
import ApplicationMetadata from "../types/ApplicationMetadata";
import JobMonitor, {
  validateAndConvertState as validateAndConvertState_JobMonitor,
} from "./JobMonitor/JobMonitor";

export const applicationList: ApplicationMetadata[] = [
  {
    name: "Job Monitor",
    component: JobMonitor,
    icon: Monitor,
    validateAndConvertState: validateAndConvertState_JobMonitor,
  },
  {
    name: "File Catalog",
    component: JobMonitor,
    icon: FolderCopy,
  },
];
