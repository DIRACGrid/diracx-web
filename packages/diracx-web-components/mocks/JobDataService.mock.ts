import { fn } from "@storybook/test";
// @ts-ignore: Cannot find module '@actual/components/JobMonitor/JobDataService'
import * as actual from "@actual/components/JobMonitor/JobDataService";

export const useJobs = fn(actual.useJobs);
export const refreshJobs = fn(actual.refreshJobs);
export const deleteJobs = fn(actual.deleteJobs);
export const killJobs = fn(actual.killJobs);
export const rescheduleJobs = fn(actual.rescheduleJobs);
export const getJobHistory = fn(actual.getJobHistory);
