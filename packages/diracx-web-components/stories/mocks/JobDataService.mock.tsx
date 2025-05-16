/* eslint-disable */
import { Job, JobHistory, SearchBody } from "../../src/types";

// Mock data store for jobs
let mockJobsResponse: {
  jobs: Job[] | null;
  error: Error | null;
  isLoading: boolean;
} = {
  jobs: null,
  error: null,
  isLoading: false,
};

// Mock data store for job history
let mockJobHistoryResponse: {
  jobHistory: JobHistory[] | null;
  error: Error | null;
  isLoading: boolean;
} = {
  jobHistory: null,
  error: null,
  isLoading: false,
};

// Function to set mock jobs data
export function setJobsMock(data: {
  jobs: Job[] | null;
  error: Error | null;
  isLoading: boolean;
}) {
  mockJobsResponse = data;
}

// Function to set mock job history data
export function setJobHistoryMock(data: {
  jobHistory: JobHistory[] | null;
  error: Error | null;
  isLoading: boolean;
}) {
  mockJobHistoryResponse = data;
}

// Mock implementation of `useJobs`
export const useJobs = (
  diracxUrl: string | null,
  accessToken: string,
  searchBody: any,
  page: number,
  rowsPerPage: number,
) => {
  if (mockJobsResponse.error) {
    return {
      data: undefined,
      error: mockJobsResponse.error,
      isLoading: mockJobsResponse.isLoading,
      isValidating: false,
    };
  }

  // Create headers with content-range for pagination
  const headers = new Headers();
  headers.append(
    "content-range",
    `jobs 0-${mockJobsResponse.jobs?.length || 0}/${mockJobsResponse.jobs?.length || 0}`,
  );

  return {
    data: mockJobsResponse.jobs
      ? {
          headers,
          data: mockJobsResponse.jobs,
        }
      : undefined,
    error: null,
    isLoading: mockJobsResponse.isLoading,
    isValidating: false,
  };
};

// Mock implementation of `getJobHistory`
export const getJobHistory = async (
  diracxUrl: string | null,
  jobId: number,
  accessToken: string,
): Promise<{ data: JobHistory[] }> => {
  if (mockJobHistoryResponse.error) {
    throw mockJobHistoryResponse.error;
  }
  return { data: mockJobHistoryResponse.jobHistory || [] };
};

// Mock implementation of refreshJobs
export const refreshJobs = (
  diracxUrl: string | null,
  accessToken: string,
  searchBody: SearchBody,
  page: number,
  rowsPerPage: number,
) => {
  // Just a mock, doesn't need to do anything
  return Promise.resolve();
};

// Mock implementation of deleteJobs
export function deleteJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: any }> {
  return Promise.resolve({
    headers: new Headers(),
    data: { success: true },
  });
}

// Mock implementation of killJobs
export function killJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: any }> {
  return Promise.resolve({
    headers: new Headers(),
    data: {
      success: selectedIds.reduce(
        (acc, id) => {
          acc[id] = {};
          return acc;
        },
        {} as Record<number, {}>,
      ),
      failed: {},
    },
  });
}

// Mock implementation of rescheduleJobs
export function rescheduleJobs(
  diracxUrl: string | null,
  selectedIds: readonly number[],
  accessToken: string,
): Promise<{ headers: Headers; data: any }> {
  return Promise.resolve({
    headers: new Headers(),
    data: {
      success: selectedIds.reduce(
        (acc, id) => {
          acc[id] = {};
          return acc;
        },
        {} as Record<number, {}>,
      ),
      failed: {},
    },
  });
}
