"use client";

import useSWR, { mutate } from "swr";
import dayjs from "dayjs";
import { fetcher } from "../../hooks/utils";
import { Filter, SearchBody, Job, JobHistory } from "../../types";

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
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) => {
  processSearchBody(searchBody);
  const urlGetJobs = `/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;

  return useSWR([urlGetJobs, accessToken, "POST", searchBody], (args) =>
    fetcher<Job[]>(args),
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
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) => {
  processSearchBody(searchBody);
  const urlGetJobs = `/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;
  mutate([urlGetJobs, accessToken, "POST", searchBody]);
};

/**
 * Deletes jobs with the specified IDs.
 *
 * @param selectedIds - An array of job IDs to delete.
 * @param accessToken - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function deleteJobs(
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: number[] }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const deleteUrl = `/api/jobs/?${queryString}`;
  return fetcher([deleteUrl, accessToken, "DELETE"]);
}

/**
 * Kills the specified jobs.
 *
 * @param selectedIds - An array of job IDs to be killed.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function killJobs(
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: number[] }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const killUrl = `/api/jobs/kill?${queryString}`;
  return fetcher([killUrl, accessToken, "POST"]);
}

/**
 * Reschedules the specified jobs.
 *
 * @param selectedIds - An array of job IDs to be rescheduled.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function rescheduleJobs(
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: number[] }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const rescheduleUrl = `/api/jobs/reschedule?${queryString}`;
  return fetcher([rescheduleUrl, accessToken, "POST"]);
}

/**
 * Retrieves the job history for a given job ID.
 * @param jobId - The ID of the job.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the job history.
 */
export function getJobHistory(
  jobId: number,
  accessToken: string,
): Promise<{ headers: Headers; data: { [key: number]: JobHistory[] } }> {
  const historyUrl = `/api/jobs/${jobId}/status/history`;
  return fetcher([historyUrl, accessToken]);
}
