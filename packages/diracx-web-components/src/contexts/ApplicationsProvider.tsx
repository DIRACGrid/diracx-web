"use client";

import React, { createContext, useEffect, useState } from "react";
import { applicationList } from "../components/ApplicationList";
import { DashboardGroup } from "../types/DashboardGroup";
import ApplicationMetadata from "../types/ApplicationMetadata";

// Create a context for the UserDashboard state
export const ApplicationsContext = createContext<
  [
    DashboardGroup[],
    React.Dispatch<React.SetStateAction<DashboardGroup[]>>,
    ApplicationMetadata[],
    string, // Id of the current application
    React.Dispatch<React.SetStateAction<string>>,
  ]
>([[], () => {}, [], "", () => {}]);

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
  defaultUserDashboard,
}: ApplicationsProviderProps) => {
  const loadedDashboard = sessionStorage.getItem("savedDashboard");
  const parsedDashboard: DashboardGroup[] = loadedDashboard
    ? JSON.parse(loadedDashboard)
    : null;

  const [userDashboard, setUserDashboard] = useState<DashboardGroup[]>(
    parsedDashboard || [],
  );

  const [currentAppId, setCurrentAppId] = useState<string>("");

  useEffect(() => {
    if (userDashboard.length !== 0) return;

    setUserDashboard(
      defaultUserDashboard || [
        {
          title: "My dashboard",
          extended: true,
          items: [
            {
              title: "My Jobs",
              type: "Job Monitor",
              id: "JobMonitor0",
            },
          ],
        },
      ],
    );
  }, [appList, defaultUserDashboard]);

  // Save the dashboard in session storage
  useEffect(() => {
    sessionStorage.setItem("savedDashboard", JSON.stringify(userDashboard));
  }, [userDashboard]);

  return (
    <ApplicationsContext.Provider
      value={[
        userDashboard,
        (group) => {
          setUserDashboard(group);
        },
        appList,
        currentAppId,
        setCurrentAppId,
      ]}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
