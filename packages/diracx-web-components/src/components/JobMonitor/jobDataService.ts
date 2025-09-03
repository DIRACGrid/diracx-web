"use client";
import useSWR from "swr";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { fetcher } from "../../hooks/utils";
import { Filter, SearchBody, Job, JobHistory } from "../../types";
import type { JobSummary } from "../../types";

type TimeUnit = "minute" | "hour" | "day" | "month" | "year";

dayjs.extend(utc);
/**
 * Convert the 'last' operator in the search body to a date filter.
 * @param searchBody The search body to be processed
 * @returns The processed search body with adjusted filters
 */
function processSearchBody(searchBody: SearchBody) {
  searchBody.search = searchBody.search?.map((filter: Filter) => {
    if (filter.operator == "last") {
      const valueStr = filter.value as string;
      const match = valueStr.match(/^(\d+)\s*(minute|hour|day|month|year)s?$/i);

      if (match) {
        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase() as TimeUnit;

        return {
          parameter: filter.parameter,
          operator: "gt",
          value: dayjs().subtract(amount, unit).toISOString(),
          values: filter.values,
        };
      } else {
        return {
          parameter: filter.parameter,
          operator: "gt",
          value: dayjs()
            .subtract(1, filter.value as TimeUnit)
            .toISOString(),
          values: filter.values,
        };
      }
    }
    return filter;
  });
}

/**
 * Deletes jobs with the specified IDs.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param selectedIds - An array of job IDs to delete.
 * @param accessToken - The authentication token.
 * @param accessTokenPayload - Information about the user.
 */
export function deleteJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
  accessTokenPayload: Record<string, number | string>,
) {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for deleting jobs.");
  }

  const deleteUrl = `${diracxUrl}/api/jobs/status`;

  const currentDate = dayjs().utc().toISOString();

  const body = selectedIds.reduce((acc: StatusBody, jobId) => {
    acc[jobId] = {
      [currentDate]: {
        Status: "Deleted",
        MinorStatus: "Marked for deletion",
        Source: `User: ${accessTokenPayload["preferred_username"]}`,
      },
    };
    return acc;
  }, {});
  return fetcher([deleteUrl, accessToken, "PATCH", body]);
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
 * @param diracxUrl - The base URL of the DiracX API.
 * @param selectedIds - An array of job IDs to be killed.
 * @param accessToken - The authentication token.
 * @param accessTokenPayload - Information about the user.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
export function killJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
  accessTokenPayload: Record<string, number | string>,
): Promise<{ headers: Headers; data: JobBulkResponse }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for killing jobs.");
  }
  const killUrl = `${diracxUrl}/api/jobs/status`;
  const currentDate = dayjs().utc().toISOString();

  const body = selectedIds.reduce((acc: StatusBody, jobId) => {
    acc[jobId] = {
      [currentDate]: {
        Status: "Killed",
        MinorStatus: "Marked for termination",
        Source: `User: ${accessTokenPayload["preferred_username"]}`,
      },
    };
    return acc;
  }, {});
  return fetcher([killUrl, accessToken, "PATCH", body]);
}

/**
 * Reschedules the specified jobs.
 *
 * @param diracxUrl - The base URL of the DiracX API.
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
  const body = {
    job_ids: selectedIds,
  };

  const rescheduleUrl = `${diracxUrl}/api/jobs/reschedule`;
  return fetcher([rescheduleUrl, accessToken, "POST", body]);
}

/**
 * Retrieves the job history for a given job ID.
 *
 * @param diracxUrl - The base URL of the DiracX API.
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
 * Retrieves the job summary for a given grouping.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param grouping - An array of strings representing the grouping fields.
 * @param accessToken - The authentication token.
 * @param searchBody - The search body to be sent along with the request (optional).
 * @returns A Promise that resolves to an object containing the job summary data.
 */
export async function getJobSummary(
  diracxUrl: string | null,
  grouping: string[],
  accessToken: string,
  searchBody?: SearchBody,
): Promise<{ data: JobSummary[] }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for fetching job summary.");
  }

  if (searchBody) processSearchBody(searchBody);

  const summaryUrl = `${diracxUrl}/api/jobs/summary`;
  const body = {
    grouping: grouping,
    search: searchBody?.search || [],
  };
  // Expect the response to be an array of objects with all the grouping fields
  const { data } = await fetcher<Array<JobSummary>>([
    summaryUrl,
    accessToken,
    "POST",
    body,
  ]);

  return { data };
}

/**
 * Custom hook for fetching jobs data.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param accessToken - The access token for authentication.
 * @param searchBody - The search body for filtering jobs.
 * @param page - The page number for pagination.
 * @param rowsPerPage - The number of rows per page.
 * @returns The response from the API call.
 */
export function useJobs(
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) {
  /** The url to fetch jobs */
  const urlGetJobs = getSearchJobUrl(diracxUrl, page, rowsPerPage);

  /** The key used to revalidate the SWR cache */
  const swrKey: [string, SearchBody] | null = urlGetJobs
    ? [urlGetJobs, searchBody]
    : null;

  const {
    data: swrData,
    error: swrError,
    isLoading,
  } = useSWR(
    swrKey,
    async ([url, _searchBody]) => {
      processSearchBody(_searchBody);

      const body = {
        search: _searchBody.search || [],
        sort: _searchBody.sort || [],
      };

      if (diracxUrl) {
        return await fetcher<Job[]>([url, accessToken, "POST", body]);
      }

      return {
        headers: new Headers(),
        data: null as Job[] | null,
        isLoading: false,
        error: new Error("Invalid URL generated for fetching jobs."),
      };
    },
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
      shouldRetryOnError: false,
    },
  );

  return {
    headers: swrData?.headers ?? new Headers(),
    data: (swrData?.data as Job[] | undefined) ?? null,
    isLoading,
    error: swrError,
  };
}

/**
 * Generates the URL for searching jobs.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param page - The page number for pagination.
 * @param rowsPerPage - The number of rows per page.
 * @returns The URL for the job search API endpoint.
 */
export function getSearchJobUrl(
  diracxUrl: string | null,
  page: number,
  rowsPerPage: number,
) {
  if (!diracxUrl) {
    return null;
  }

  return `${diracxUrl}/api/jobs/search?page=${page + 1}&per_page=${rowsPerPage}`;
}
