import { useOidcAccessToken } from "@axa-fr/react-oidc";
import useSWR from "swr";

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
  const { accessToken } = useOidcAccessToken();
  const url = `${process.env.NEXT_PUBLIC_DIRACX_URL}/jobs/search?page=0&per_page=100`;
  const { data, error } = useSWR([url, accessToken], fetcher);

  return {
    data,
    error,
    isLoading: !data && !error,
  };
}
