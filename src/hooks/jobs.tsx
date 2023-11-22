import { useOidcAccessToken } from "@axa-fr/react-oidc";
import useSWR from "swr";
import { useDiracxUrl, fetcher } from "./utils";

/**
 * Fetches the jobs from the /api/jobs/search endpoint
 * @returns the jobs
 */
export function useJobs() {
  const diracxUrl = useDiracxUrl();
  const { accessToken } = useOidcAccessToken();

  const url = `${diracxUrl}/api/jobs/search?page=0&per_page=100`;
  const { data, error } = useSWR([url, accessToken, "POST"], fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
}
