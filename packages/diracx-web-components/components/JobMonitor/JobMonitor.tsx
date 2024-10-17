"use client";
import React from "react";
import { JobDataTable } from "./JobDataTable";
import ApplicationHeader from "@/components/shared/ApplicationHeader";

/**
 * Build the Job Monitor application
 *
 * @returns Job Monitor content
 */
export default function JobMonitor({
  headerSize,
}: {
  /**  The size of the header, optional */
  headerSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <div>
      <ApplicationHeader type="Job Monitor" size={headerSize} />
      <JobDataTable />
    </div>
  );
}
