// Types for sandbox-related API responses

// Response for /api/jobs/<jobId>/sandbox/<sbType>
export type JobSandboxPFNResponse = string[];

// Response for /api/jobs/sandbox?pfn=...
export interface SandboxUrlResponse {
  url: string;
  expires_in: number;
}
