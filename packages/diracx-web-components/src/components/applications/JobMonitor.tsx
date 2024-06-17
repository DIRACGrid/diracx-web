"use client";
import React from "react";
import { JobDataTable } from "../ui/JobDataTable";
import ApplicationHeader from "@/components/ui/ApplicationHeader";

/**
 * Build the Job Monitor application
 * @param headerSize - The size of the header, optional
 * @returns Job Monitor content
 */
export default function JobMonitor({
  headerSize,
}: {
  headerSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <div>
      <ApplicationHeader type="Job Monitor" size={headerSize} />
      <JobDataTable />
    </div>
  );
}
