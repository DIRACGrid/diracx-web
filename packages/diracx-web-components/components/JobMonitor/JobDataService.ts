import useSWR, { mutate } from "swr";
import { fetcher } from "@/hooks/utils";

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
  searchBody: any,
  page: number,
  rowsPerPage: number,
) => {
  const urlGetJobs = `/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;
  return useSWR([urlGetJobs, accessToken, "POST", searchBody], fetcher);
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
  searchBody: any,
  page: number,
  rowsPerPage: number,
) => {
  const urlGetJobs = `/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;
  mutate([urlGetJobs, accessToken, "POST", searchBody]);
};

/**
 * Deletes jobs with the specified IDs.
 *
 * @param selectedIds - An array of job IDs to delete.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function deleteJobs(
  selectedIds: readonly number[],
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const deleteUrl = `/api/jobs/?${queryString}`;
  return fetcher([deleteUrl, token, "DELETE"]);
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
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const killUrl = `/api/jobs/kill?${queryString}`;
  return fetcher([killUrl, token, "POST"]);
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
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const queryString = selectedIds.map((id) => `job_ids=${id}`).join("&");
  const rescheduleUrl = `/api/jobs/reschedule?${queryString}`;
  return fetcher([rescheduleUrl, token, "POST"]);
}

/**
 * Retrieves the job history for a given job ID.
 * @param jobId - The ID of the job.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the job history.
 */
export function getJobHistory(
  jobId: number,
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const historyUrl = `/api/jobs/${jobId}/status/history`;
  return fetcher([historyUrl, token]);
}

export function getSandboxes(
  jobId: number,
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const url = `/api/jobs/${jobId}/sandbox`;
  return fetcher([url, token]);
}

export function getSandbox(
  jobId: number,
  sbType: "input" | "output",
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const url = `/api/jobs/${jobId}/sandbox/${sbType}`;
  return fetcher([url, token]);
}

export function getSandboxUrl(
  pfn: string,
  token: any,
): Promise<{ headers: Headers; data: any }> {
  const url = `/api/jobs/sandbox?pfn=${pfn}`;
  return fetcher([url, token]);
}
