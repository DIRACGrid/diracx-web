"use client";
import useSWR from "swr";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { fetcher } from "../../services/client";
import { MAX_BULK_RESULTS } from "../shared/DataTable/SplitActionButton";
import type { JobSummary } from "../../types";
import {
  Filter,
  SearchBody,
  Job,
  JobHistory,
  JobSandboxPFNResponse,
  SandboxUrlResponse,
} from "../../types";

type TimeUnit = "minute" | "hour" | "day" | "month" | "year";

dayjs.extend(utc);
/**
 * Convert the 'last' operator in the search body to a date filter.
 * @param searchBody The search body to be processed
 * @returns The processed search body with adjusted filters
 */
function processSearchBody(searchBody: SearchBody): SearchBody {
  return {
    ...searchBody,
    search: searchBody.search?.map((filter: Filter) => {
      if (filter.operator == "last") {
        const valueStr = filter.value as string;
        const match = valueStr.match(
          /^(\d+)\s*(minute|hour|day|month|year)s?$/i,
        );

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
    }),
  };
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
 * Updates the status of jobs with the specified IDs.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param selectedIds - An array of job IDs to update.
 * @param accessToken - The authentication token.
 * @param accessTokenPayload - Information about the user.
 * @param status - The new status to set (e.g. "Deleted", "Killed").
 * @param minorStatus - The minor status message.
 * @returns A Promise that resolves to an object containing the response headers and data.
 */
function updateJobStatus(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
  accessTokenPayload: Record<string, number | string>,
  status: string,
  minorStatus: string,
): Promise<{ headers: Headers; data: JobBulkResponse }> {
  if (!diracxUrl) {
    throw new Error(`Invalid URL generated for setting jobs to ${status}.`);
  }

  const currentDate = dayjs().utc().toISOString();

  const body = selectedIds.reduce((acc: StatusBody, jobId) => {
    acc[jobId] = {
      [currentDate]: {
        Status: status,
        MinorStatus: minorStatus,
        Source: `User: ${accessTokenPayload["preferred_username"]}`,
      },
    };
    return acc;
  }, {});
  return fetcher({
    url: `${diracxUrl}/api/jobs/status`,
    accessToken,
    method: "PATCH",
    body,
  });
}

/**
 * Deletes jobs with the specified IDs.
 */
export function deleteJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
  accessTokenPayload: Record<string, number | string>,
) {
  return updateJobStatus(
    diracxUrl,
    selectedIds,
    accessToken,
    accessTokenPayload,
    "Deleted",
    "Marked for deletion",
  );
}

/**
 * Kills the specified jobs.
 */
export function killJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
  accessTokenPayload: Record<string, number | string>,
): Promise<{ headers: Headers; data: JobBulkResponse }> {
  return updateJobStatus(
    diracxUrl,
    selectedIds,
    accessToken,
    accessTokenPayload,
    "Killed",
    "Marked for termination",
  );
}

/**
 * Retrieves the job history for a given job ID.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param jobId - The ID of the job.
 * @param accessToken - The authentication token.
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
  const { data } = await fetcher<
    Array<{ JobID: number; LoggingInfo: JobHistory[] }>
  >({
    url: `${diracxUrl}/api/jobs/search`,
    accessToken,
    method: "POST",
    body,
  });

  if (!Array.isArray(data) || data.length === 0 || !data[0]?.LoggingInfo) {
    throw new Error("No history found for this job");
  }

  return { data: data[0].LoggingInfo };
}

/**
 * Retrieves the sandbox information for a given job ID and sandbox type.
 * @param diracxUrl - The base URL of the DiracX API.
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
  return fetcher({
    url: `${diracxUrl}/api/jobs/${jobId}/sandbox/${sbType}`,
    accessToken,
  });
}

/**
 * Retrieves the sandbox URL for a given PFN.
 * @param diracxUrl - The base URL of the DiracX API.
 * @param pfn - The PFN of the job.
 * @param accessToken - The authentication token.
 * @returns A Promise that resolves to an object containing the headers and data of the sandbox URL.
 */
export function getJobSandboxUrl(
  diracxUrl: string | null,
  pfn: string,
  accessToken: string,
): Promise<{ headers: Headers; data: SandboxUrlResponse }> {
  // Validate PFN format: must start with / or a known protocol
  if (!/^(\/|https?:\/\/|s3:\/\/|srm:\/\/)/.test(pfn)) {
    throw new Error(
      `Invalid PFN format: "${pfn}". Must start with / or a known protocol (http, https, s3, srm).`,
    );
  }
  return fetcher({
    url: `${diracxUrl}/api/jobs/sandbox?pfn=${encodeURIComponent(pfn)}`,
    accessToken,
  });
}

/**
 * Retrieves the job summary for a given grouping.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param grouping - An array of strings representing the grouping fields.
 * @param accessToken - The authentication token.
 * @param searchBody - The search body to be sent along with the request (optional).
 * @param signal - Optional signal to abort the request.
 * @returns A Promise that resolves to an object containing the job summary data.
 */
export async function getJobSummary(
  diracxUrl: string | null,
  grouping: string[],
  accessToken: string,
  searchBody?: SearchBody,
  signal?: AbortSignal,
): Promise<{ data: JobSummary[] }> {
  if (!diracxUrl) {
    throw new Error("Invalid URL generated for fetching job summary.");
  }

  const processed = searchBody ? processSearchBody(searchBody) : searchBody;

  const body = {
    grouping: grouping,
    search: processed?.search || [],
  };
  const { data } = await fetcher<Array<JobSummary>>({
    url: `${diracxUrl}/api/jobs/summary`,
    accessToken,
    method: "POST",
    body,
    signal,
  });

  return { data };
}

/**
 * Custom hook for fetching job summary data using SWR.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param accessToken - The access token for authentication.
 * @param grouping - The column to group by (API field name).
 * @param searchBody - The search body for filtering jobs.
 * @returns The summary data, loading state, and error.
 */
export function useJobSummary(
  diracxUrl: string | null,
  accessToken: string | undefined,
  grouping: string,
  searchBody: SearchBody,
) {
  const summaryUrl =
    diracxUrl && accessToken ? `${diracxUrl}/api/jobs/summary` : null;

  const swrKey: [string, string, SearchBody] | null = summaryUrl
    ? [summaryUrl, grouping, searchBody]
    : null;

  const {
    data: swrData,
    error: swrError,
    isLoading,
  } = useSWR(
    swrKey,
    async ([url, _grouping, _searchBody]) => {
      const processed = processSearchBody(_searchBody);

      const body = {
        grouping: [_grouping],
        search: processed.search || [],
      };

      const result = await fetcher<JobSummary[]>({
        url,
        accessToken: accessToken!,
        method: "POST",
        body,
      });
      // Tag the rows with the grouping that produced them: with
      // keepPreviousData, consumers receive the PREVIOUS grouping's rows
      // while a new grouping is loading, and must label them by this value
      // rather than by the currently requested grouping.
      return { rows: result.data, grouping: _grouping };
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Same freshness rationale as useJobs: cached groupings must revalidate
      // when the user switches back to them.
      revalidateIfStale: true,
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      // Keep showing the previous summary while a new key is loading,
      // instead of unmounting the chart into a skeleton.
      keepPreviousData: true,
    },
  );

  return {
    data: swrData?.rows ?? null,
    /**
     * The grouping column that produced `data`. Lags behind the requested
     * grouping while a new one is loading (keepPreviousData).
     */
    dataGrouping: swrData?.grouping ?? null,
    isLoading,
    error: swrError,
  };
}

/**
 * Custom hook for fetching jobs data.
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param accessToken - The access token for authentication.
 * @param searchBody - The search body for filtering jobs.
 * @param page - The page number for pagination.
 * @param rowsPerPage - The number of rows per page.
 * @param visibleColumns - Column IDs to request from the API (`parameters`
 *   projection). When omitted, all columns are returned by the backend.
 * @returns The response from the API call.
 */
export function useJobs(
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
  visibleColumns?: string[],
) {
  /** The url to fetch jobs */
  const urlGetJobs = getSearchJobUrl(diracxUrl, page, rowsPerPage);

  /**
   * The key used to revalidate the SWR cache.
   * The visible columns are part of the key so that toggling column
   * visibility naturally refetches with the new projection.
   */
  const swrKey: [string, SearchBody, string[] | null] | null = urlGetJobs
    ? [urlGetJobs, searchBody, visibleColumns ?? null]
    : null;

  const {
    data: swrData,
    error: swrError,
    isLoading,
  } = useSWR(
    swrKey,
    async ([url, _searchBody, _visibleColumns]) => {
      const processed = processSearchBody(_searchBody);

      const body = {
        ...(_visibleColumns && _visibleColumns.length > 0
          ? { parameters: _visibleColumns }
          : {}),
        search: processed.search || [],
        sort: processed.sort || [],
      };

      return await fetcher<Job[]>({
        url,
        accessToken,
        method: "POST",
        body,
      });
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Revalidate cached entries when the key changes back to one seen
      // earlier (e.g. toggling rows-per-page): otherwise the table serves
      // pre-refresh data from the cache and never refetches it.
      revalidateIfStale: true,
      // Deduping only guards against render-storm duplicates; a long window
      // here acts as an accidental freshness policy and pins stale pages.
      dedupingInterval: 5000,
      shouldRetryOnError: false,
      // Keep showing the previous page's rows while a new key (page/sort/
      // filter/column change) is loading, instead of unmounting the table.
      keepPreviousData: true,
    },
  );

  if (!diracxUrl) {
    return {
      headers: new Headers(),
      data: null,
      isLoading: false,
      error: new Error("Invalid URL generated for fetching jobs."),
    };
  }

  return {
    headers: swrData?.headers ?? new Headers(),
    data: (swrData?.data as Job[] | undefined) ?? null,
    isLoading,
    error: swrError,
  };
}

/**
 * Fetches all job IDs matching the current search filters.
 * Uses the `parameters` field to request only JobID, with
 * per_page=MAX_BULK_RESULTS (the same limit that gates bulk actions in the
 * toolbar, so no matching ID is silently truncated).
 *
 * @param diracxUrl - The base URL of the DiracX API.
 * @param accessToken - The access token for authentication.
 * @param searchBody - The search body for filtering jobs.
 * @returns An array of job IDs.
 */
export async function fetchMatchingJobIds(
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
): Promise<number[]> {
  if (!diracxUrl) {
    throw new Error("Invalid URL for fetching job IDs.");
  }

  const body = {
    parameters: ["JobID"],
    search: searchBody.search || [],
    sort: searchBody.sort || [],
  };

  // Process 'last' operator before sending
  const processedBody = processSearchBody({
    ...body,
    search: [...(body.search || [])],
  } as SearchBody);

  const result = await fetcher<{ JobID: number }[]>({
    url: `${diracxUrl}/api/jobs/search?page=1&per_page=${MAX_BULK_RESULTS}`,
    accessToken,
    method: "POST",
    body: processedBody,
  });

  return (result.data as { JobID: number }[]).map((item) => item.JobID);
}

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
