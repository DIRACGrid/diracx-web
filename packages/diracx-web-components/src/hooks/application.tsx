"use client";

import { use, useMemo } from "react";
import { ApplicationsContext } from "../contexts/ApplicationsProvider";

/**
 * Custom hook to access the application id from the context
 * @returns the application id
 */
export function useApplicationId() {
  const [, , , appId] = use(ApplicationsContext);
  return appId;
}

/**
 * Custom hook to access the application title based on the application id
 * @returns the application title
 */
export function useApplicationTitle() {
  const [userDashboard, , , appId] = use(ApplicationsContext);

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

/**
 * Custom hook to access the application title based on the application id
 * @returns the application type
 */
export function useApplicationType() {
  const [userDashboard] = use(ApplicationsContext);
  const appId = useApplicationId();

  return useMemo(() => {
    if (!userDashboard || !appId) return null;

    const app = userDashboard.reduce(
      (acc, group) => {
        if (acc) return acc;
        return group.items.find((app) => app.id === appId);
      },
      undefined as { type: string } | undefined,
    );
    return app?.type;
  }, [userDashboard, appId]);
}
