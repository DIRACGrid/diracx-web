import { useOidcAccessToken } from "@axa-fr/react-oidc";
import useSWR from "swr";
import { useDiracxUrl } from "./utils";

const fetcher = (args: any[]) => {
  const [url, accessToken] = args;

  return fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken },
  }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  });
};

export function useJobs() {
  const diracxUrl = useDiracxUrl();
  const { accessToken } = useOidcAccessToken();
  const url = diracxUrl
    ? `${diracxUrl}/api/jobs/search?page=0&per_page=100`
    : null;

  const { data, error } = useSWR(url ? [url, accessToken] : null, fetcher);

  if (diracxUrl === null) {
    return { data: null, error: "diracxUrl is null", isLoading: false };
  }

  return {
    data,
    error,
    isLoading: !data && !error,
  };
}
