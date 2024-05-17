import { useContext, useMemo } from "react";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";

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
  const [sections] = useContext(ApplicationsContext);
  const appId = useApplicationId();

  return useMemo(() => {
    if (!sections || !appId) return null;

    const app = sections.reduce(
      (acc, section) => {
        if (acc) return acc;
        return section.items.find((app) => app.id === appId);
      },
      undefined as { title: string } | undefined,
    );
    return app?.title;
  }, [sections, appId]);
}
