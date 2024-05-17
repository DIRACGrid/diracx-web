"use client";
import * as React from "react";
import { JobDataTable } from "../ui/JobDataTable";
import ApplicationHeader from "@/components/ui/ApplicationHeader";

/**
 * Build the Job Monitor application
 * @returns Job Monitor content
 */
export default function JobMonitor() {
  return (
    <div>
      <ApplicationHeader type="Job Monitor" />
      <JobDataTable />
    </div>
  );
}
