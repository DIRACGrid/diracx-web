/* eslint-disable */
import { Job, JobHistory, SearchBody, JobSummary } from "../../src/types";

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
  _diracxUrl: string | null,
  _accessToken: string,
  _searchBody: any,
  _page: number,
  _rowsPerPage: number,
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
  _diracxUrl: string | null,
  _jobId: number,
  _accessToken: string,
): Promise<{ data: JobHistory[] }> => {
  if (mockJobHistoryResponse.error) {
    throw mockJobHistoryResponse.error;
  }
  return { data: mockJobHistoryResponse.jobHistory || [] };
};

// Mock implementation of refreshJobs
export const refreshJobs = (
  _diracxUrl: string | null,
  _accessToken: string,
  _searchBody: SearchBody,
  _page: number,
  _rowsPerPage: number,
) => {
  // Just a mock, doesn't need to do anything
  return Promise.resolve();
};

// Mock implementation of deleteJobs
export function deleteJobs(
  _diracxUrl: string | null,
  _selectedIds: readonly number[],
  _accessToken: string,
): Promise<{ headers: Headers; data: any }> {
  return Promise.resolve({
    headers: new Headers(),
    data: { success: true },
  });
}

// Mock implementation of killJobs
export function killJobs(
  _diracxUrl: string | null,
  selectedIds: readonly number[],
  _accessToken: string,
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
  _diracxUrl: string | null,
  selectedIds: readonly number[],
  _accessToken: string,
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

// Mock implementation of getJobSummary
export async function getJobSummary(
  _diracxUrl: string | null,
  _grouping: string[],
  _accessToken: string,
): Promise<{ data: JobSummary[] }> {
  return Promise.resolve({
    data: [
      {
        Status: "Running",
        MinorStatus: "None",
        ApplicationStatus: "Accepted",
        Site: "SiteA",
        JobName: "Job 1",
        JobType: "TypeA",
        JobGroup: "GroupA",
        Owner: "UserA",
        OwnerGroup: "GroupA",
        VO: "VOA",
        UserPriority: 100,
        RescheduleCounter: 0,
      },
      {
        Status: "Completed",
        MinorStatus: "None",
        ApplicationStatus: "Finished",
        Site: "SiteB",
        JobName: "Job 2",
        JobType: "TypeB",
        JobGroup: "GroupB",
        Owner: "UserB",
        OwnerGroup: "GroupB",
        VO: "VOB",
        UserPriority: 200,
        RescheduleCounter: 1,
      },
      {
        Status: "Failed",
        MinorStatus: "Error",
        ApplicationStatus: "Failed",
        Site: "SiteC",
        JobName: "Job 3",
        JobType: "TypeC",
        JobGroup: "GroupC",
        Owner: "UserC",
        OwnerGroup: "GroupC",
        VO: "VOC",
        UserPriority: 300,
        RescheduleCounter: 2,
      },
    ],
  });
}
