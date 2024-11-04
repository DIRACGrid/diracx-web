"use client";

export interface Job {
  JobID: number;
  JobName: string;
  JobGroup: string;
  JobType: string;
  Owner: string;
  OwnerGroup: string;
  VO: string;
  Site: string;
  Status: string;
  MinorStatus: string;
  ApplicationStatus: string;
  SubmissionTime: Date;
  RescheduleTime: Date | null;
  LastUpdateTime: Date;
  StartExecTime: Date | null;
  HeartBeatTime: Date | null;
  EndExecTime: Date | null;
  UserPriority: number;
  RescheduleCounter: number;
  VerifiedFlag: boolean;
  AccountedFlag: string;
  [key: string]: unknown;
}
