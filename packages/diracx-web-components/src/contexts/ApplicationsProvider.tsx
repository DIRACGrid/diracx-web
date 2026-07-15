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

// Dashboard context (changes on drag-drop, add/remove of applications)
export interface DashboardContextType {
  userDashboard: DashboardGroup[];
  setUserDashboard: React.Dispatch<React.SetStateAction<DashboardGroup[]>>;
}

export const DashboardContext = createContext<DashboardContextType>({
  userDashboard: [],
  setUserDashboard: () => {},
});

// Narrow context carrying only the current application id, so that
// dashboard edits (drag-drop, rename, add/remove) do not re-render
// consumers that only care about which app is selected.
export interface CurrentAppContextType {
  currentAppId: string;
  setCurrentAppId: React.Dispatch<React.SetStateAction<string>>;
}

export const CurrentAppContext = createContext<CurrentAppContextType>({
  currentAppId: "",
  setCurrentAppId: () => {},
});

/**
 * Structurally validates a value loaded from sessionStorage before
 * trusting it as a DashboardGroup[].
 */
function isDashboardGroupArray(value: unknown): value is DashboardGroup[] {
  return (
    Array.isArray(value) &&
    value.every((group) => {
      if (typeof group !== "object" || group === null) return false;
      const g = group as Partial<DashboardGroup>;
      return (
        typeof g.title === "string" &&
        typeof g.extended === "boolean" &&
        Array.isArray(g.items) &&
        g.items.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.type === "string",
        )
      );
    })
  );
}

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
  const [userDashboard, setUserDashboard] = useState<DashboardGroup[]>(() => {
    if (typeof sessionStorage === "undefined") return defaultUserDashboard;
    const loaded = sessionStorage.getItem("savedDashboard");
    if (!loaded) return defaultUserDashboard;
    try {
      const parsed: unknown = JSON.parse(loaded);
      if (!isDashboardGroupArray(parsed)) {
        console.warn(
          'Dashboard state from sessionStorage ("savedDashboard") has an unexpected shape. Using defaults.',
        );
        return defaultUserDashboard;
      }
      return parsed;
    } catch {
      console.warn(
        'Failed to parse dashboard state from sessionStorage ("savedDashboard"). Using defaults.',
      );
      return defaultUserDashboard;
    }
  });

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
    }),
    [userDashboard],
  );

  const currentAppValue = useMemo(
    (): CurrentAppContextType => ({ currentAppId, setCurrentAppId }),
    [currentAppId],
  );

  return (
    <AppListContext value={appListValue}>
      <DashboardContext value={dashboardValue}>
        <CurrentAppContext value={currentAppValue}>
          {children}
        </CurrentAppContext>
      </DashboardContext>
    </AppListContext>
  );
};
