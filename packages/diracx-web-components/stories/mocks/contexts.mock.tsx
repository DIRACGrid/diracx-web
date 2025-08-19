import React, { createContext, useContext } from "react";
import { Job, JobHistory } from "../../src/types";

interface JobMockContextType {
  jobs: Job[] | null;
  jobHistory: JobHistory[] | null;
  error: Error | null;
  isLoading: boolean;
}

interface MockProviderProps {
  children: React.ReactNode;
  jobs: Job[] | null;
  jobHistory: JobHistory[] | null;
  error?: Error | null;
  isLoading?: boolean;
}

const JobMockContext = createContext<JobMockContextType | undefined>(undefined);

export const useJobMockContext = () => {
  const context = useContext(JobMockContext);
  if (!context) {
    console.error("useMockContext must be used within a MockProvider");
    throw new Error("useMockContext must be used within a MockProvider");
  }
  return context;
};

export const JobMockProvider = ({
  children,
  jobs,
  jobHistory,
  error = null,
  isLoading = false,
}: MockProviderProps): React.ReactElement => {
  return (
    <JobMockContext.Provider value={{ jobs, jobHistory, error, isLoading }}>
      {children}
    </JobMockContext.Provider>
  );
};
