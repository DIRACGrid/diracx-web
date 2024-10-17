export interface Job {
  JobID: number;
  JobName: string;
  Site: string;
  Status: string;
  MinorStatus: string;
  SubmissionTime: Date;
  RescheduleTime: Date | null;
  LastUpdateTime: Date;
  StartExecTime: Date | null;
  HeartBeatTime: Date | null;
  EndExecTime: Date | null;
  ApplicationStatus: string;
  UserPriority: number;
  RescheduleCounter: number;
  VerifiedFlag: boolean;
  AccountedFlag: string;
  [key: string]: unknown;
}
