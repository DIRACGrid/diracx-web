"use client";

import useSWRImmutable, { SWRResponse } from "swr";
import { fetcher } from "./utils";

/**
 * Metadata returned by the /.well-known/dirac-metadata endpoint
 */
export interface Metadata {
  virtual_organizations: {
    [key: string]: {
      groups: {
        [key: string]: {
          properties: string[];
        };
      };
      support: {
        message: string;
        webpage: string | null;
        email: string | null;
      };
      default_group: string;
    };
  };
}

/**
 * Fetches the metadata from the /.well-known/dirac-metadata endpoint
 * @returns the metadata
 */
export function useMetadata() {
  const url = `/.well-known/dirac-metadata`;

  const {
    data,
    error,
  }: SWRResponse<{ headers: Headers; data: Metadata }, Error> = useSWRImmutable(
    [url],
    (args) => fetcher<Metadata>(args),
  );

  const metadata = data?.data;

  return {
    metadata,
    error,
    isLoading: !data && !error,
  };
}
