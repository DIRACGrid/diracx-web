"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { applicationList } from "../components/applicationList";
import { defaultDashboard } from "../components/defaultDashboard";
import { DashboardGroup } from "../types/DashboardGroup";
import ApplicationMetadata from "../types/ApplicationMetadata";

// Stable context for app list (rarely changes)
export interface AppListContextType {
  appList: ApplicationMetadata[];
}

export const AppListContext = createContext<AppListContextType>({
  appList: [],
});

// Dashboard context (changes on drag-drop, add/remove, app switch)
export interface DashboardContextType {
  userDashboard: DashboardGroup[];
  setUserDashboard: React.Dispatch<React.SetStateAction<DashboardGroup[]>>;
  currentAppId: string;
  setCurrentAppId: React.Dispatch<React.SetStateAction<string>>;
}

export const DashboardContext = createContext<DashboardContextType>({
  userDashboard: [],
  setUserDashboard: () => {},
  currentAppId: "",
  setCurrentAppId: () => {},
});

interface ApplicationsProviderProps {
  children: React.ReactNode;
  appList?: ApplicationMetadata[];
  defaultUserDashboard?: DashboardGroup[];
}

/**
 * Provides the applications context to its children components.
 *
 * @param children - The child components to be wrapped by the provider.
 * @param appList - The list of application configurations.
 * @param defaultUserDashboard - The default user dashboard.
 * @returns The applications provider.
 */
export const ApplicationsProvider = ({
  children,
  appList = applicationList,
  defaultUserDashboard = defaultDashboard,
}: ApplicationsProviderProps) => {
  const loadedDashboard = sessionStorage.getItem("savedDashboard");
  let parsedDashboard: DashboardGroup[] | null = null;
  if (loadedDashboard) {
    try {
      parsedDashboard = JSON.parse(loadedDashboard);
    } catch {
      console.warn(
        'Failed to parse dashboard state from sessionStorage ("savedDashboard"). Using defaults.',
      );
    }
  }

  const [userDashboard, setUserDashboard] = useState(
    parsedDashboard ? parsedDashboard : defaultUserDashboard,
  );

  const [currentAppId, setCurrentAppId] = useState<string>(
    userDashboard[0]?.items[0]?.id || "",
  );

  // Save the dashboard in session storage
  useEffect(() => {
    sessionStorage.setItem("savedDashboard", JSON.stringify(userDashboard));
  }, [userDashboard]);

  const appListValue = useMemo(
    (): AppListContextType => ({ appList }),
    [appList],
  );

  const dashboardValue = useMemo(
    (): DashboardContextType => ({
      userDashboard,
      setUserDashboard,
      currentAppId,
      setCurrentAppId,
    }),
    [userDashboard, currentAppId],
  );

  return (
    <AppListContext value={appListValue}>
      <DashboardContext value={dashboardValue}>{children}</DashboardContext>
    </AppListContext>
  );
};
