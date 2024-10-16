import { useContext, useMemo } from "react";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";

/**
 * Custom hook to access the application id from the URL
 * @returns the application id
 */
export function useApplicationId() {
  const { getParam } = useSearchParamsUtils();

  return useMemo(() => {
    return getParam("appId");
  }, [getParam]);
}

/**
 * Custom hook to access the application title based on the application id
 * @returns the application title
 */
export function useApplicationTitle() {
  const [userDashboard] = useContext(ApplicationsContext);
  const appId = useApplicationId();

  return useMemo(() => {
    if (!userDashboard || !appId) return null;

    const app = userDashboard.reduce(
      (acc, group) => {
        if (acc) return acc;
        return group.items.find((app) => app.id === appId);
      },
      undefined as { title: string } | undefined,
    );
    return app?.title;
  }, [userDashboard, appId]);
}
