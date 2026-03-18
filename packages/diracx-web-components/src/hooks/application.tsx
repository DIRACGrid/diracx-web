"use client";

import { use, useMemo } from "react";
import {
  AppListContext,
  CurrentAppContext,
  DashboardContext,
} from "../contexts/ApplicationsProvider";

/**
 * Custom hook to access the app list from the context
 * @returns the app list context value
 */
export function useAppList() {
  return use(AppListContext);
}

/**
 * Custom hook to access the dashboard state from the context
 * @returns the dashboard context value
 */
export function useDashboard() {
  return use(DashboardContext);
}

/**
 * Custom hook to access the application id from the context.
 * Subscribes to the narrow CurrentAppContext so dashboard edits
 * (drag-drop, rename, add/remove) do not re-render consumers.
 * @returns the application id
 */
export function useApplicationId() {
  const { currentAppId } = use(CurrentAppContext);
  return currentAppId;
}

/**
 * Custom hook to find the current application (by ID) in the dashboard.
 * @returns the current dashboard item, or null if not found
 */
export function useCurrentApplication() {
  const { userDashboard } = use(DashboardContext);
  const { currentAppId: appId } = use(CurrentAppContext);

  return useMemo(() => {
    if (!userDashboard || !appId) return null;

    for (const group of userDashboard) {
      const item = group.items.find((app) => app.id === appId);
      if (item) return item;
    }
    return null;
  }, [userDashboard, appId]);
}
