"use client";

import FolderCopy from "@mui/icons-material/FolderCopy";
import Monitor from "@mui/icons-material/Monitor";
import ApplicationMetadata from "../types/ApplicationMetadata";
import JobMonitor from "./JobMonitor/JobMonitor";
import { validateAndConvertState as validateAndConvertState_JobMonitor } from "./JobMonitor/jobColumns";

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
