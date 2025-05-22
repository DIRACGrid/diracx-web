"use client";

import useSWR, { mutate } from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import { fetcher } from "../../hooks/utils";
import {
  Filter,
  SearchBody,
  Job,
  JobHistory,
  JobSandboxPFNResponse,
  SandboxUrlResponse,
} from "../../types";

function processSearchBody(searchBody: SearchBody) {
  searchBody.search = searchBody.search?.map((filter: Filter) => {
    if (filter.operator == "last") {
      return {
        parameter: filter.parameter,
        operator: "gt",
        value: dayjs()
          .subtract(1, filter.value as "hour" | "day" | "month" | "year")
          .toISOString(),
        values: filter.values,
      };
    }
    return filter;
  });
}

/**
 * Custom hook for fetching jobs data.
 *
 * @param accessToken - The access token for authentication.
 * @param searchBody - The search body for filtering jobs.
 * @param page - The page number for pagination.
 * @param rowsPerPage - The number of rows per page.
 * @returns The response from the API call.
 */
export const useJobs = (
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) => {
  const urlGetJobs = diracxUrl
    ? `${diracxUrl}/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`
    : null;

  processSearchBody(searchBody);

  return useSWR(
    urlGetJobs ? [urlGetJobs, accessToken, "POST", searchBody] : null,
    (args) => fetcher<Job[]>(args),
    {
      revalidateOnFocus: false,
    },
  );
};

/**
 * Refreshes the jobs by mutating the SWR cache with the search body and pagination values
 *
 * @param accessToken - The access token for authentication.
 * @param searchBody - The search body containing the filters and search criteria.
 * @param page - The page number for pagination.
 * @param rowsPerPage - The number of rows per page for pagination.
 */
export const refreshJobs = (
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) => {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for refreshing jobs.");
  }

  const urlGetJobs = `${diracxUrl}/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;
  processSearchBody(searchBody);
  mutate([urlGetJobs, accessToken, "POST", searchBody]);
};

/**
 * Deletes jobs with the specified IDs.
 *
 * @param selectedIds - An array of job IDs to delete.
 * @param accessToken - The authentication token.
 */
export function deleteJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
) {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for deleting jobs.");
  }
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const deleteUrl = `${diracxUrl}/api/jobs/?${queryString}`;
  return fetcher([deleteUrl, accessToken, "DELETE"]);
}

type JobBulkResponse = {
  failed: {
    [jobId: number]: { detail: string };
  };
  success: {
    [jobId: number]: { SucessContent: unknown };
  };
};

type StatusBody = {
  [jobId: number]: {
    [timestamp: string]: {
      Status: string;
      MinorStatus: string;
      Source: string;
    };
  };
};

/**
 * Kills the specified jobs.
 *
 * @param selectedIds - An array of job IDs to be killed.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function killJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: JobBulkResponse }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for killing jobs.");
  }
  const killUrl = `${diracxUrl}/api/jobs/status`;
  const currentDate = dayjs()
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSSSSS[Z]")
    .toString();

  const body = selectedIds.reduce((acc: StatusBody, jobId) => {
    acc[jobId] = {
      [currentDate]: {
        Status: "Killed",
        MinorStatus: "Marked for termination",
        Source: "JobManager",
      },
    };
    return acc;
  }, {});
  return fetcher([killUrl, accessToken, "PATCH", body]);
}

/**
 * Reschedules the specified jobs.
 *
 * @param selectedIds - An array of job IDs to be rescheduled.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function rescheduleJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: JobBulkResponse }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for rescheduling jobs.");
  }
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const rescheduleUrl = `${diracxUrl}/api/jobs/reschedule?${queryString}`;
  return fetcher([rescheduleUrl, accessToken, "POST"]);
}

/**
 * Retrieves the job history for a given job ID.
 * @param jobId - The ID of the job.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the job history.
 */
export async function getJobHistory(
  diracxUrl: string | null,
  jobId: number,
  accessToken: string,
): Promise<{ data: JobHistory[] }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for fetching job history.");
  }
  const historyUrl = `${diracxUrl}/api/jobs/search`;
  const body = {
    parameters: ["LoggingInfo"],
    search: [
      {
        parameter: "JobID",
        operator: "eq",
        value: jobId,
      },
    ],
  };
  // Expect the response to be an array of objects with JobID and LoggingInfo
  const { data } = await fetcher<
    Array<{ JobID: number; LoggingInfo: JobHistory[] }>
  >([historyUrl, accessToken, "POST", body]);

  return { data: data[0].LoggingInfo };
}

/**
 * Retrieves the sandbox information for a given job ID and sandbox type.
 * @param jobId - The ID of the job.
 * @param sbType - The type of the sandbox (input or output).
 * @param accessToken - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the sandboxes.
 */
export function getJobSandbox(
  diracxUrl: string | null,
  jobId: number,
  sbType: "input" | "output",
  accessToken: string,
): Promise<{ headers: Headers; data: JobSandboxPFNResponse }> {
  const url = `${diracxUrl}/api/jobs/${jobId}/sandbox/${sbType}`;
  return fetcher([url, accessToken]);
}

/**
 * Retrieves the sandbox URL for a given PFN.
 * @param pfn - The PFN of the job.
 * @param accessToken - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the sandbox URL.
 */
export function getJobSandboxUrl(
  diracxUrl: string | null,
  pfn: string,
  accessToken: string,
): Promise<{ headers: Headers; data: SandboxUrlResponse }> {
  const url = `${diracxUrl}/api/jobs/sandbox?pfn=${pfn}`;
  return fetcher([url, accessToken]);
}
