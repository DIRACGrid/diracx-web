"use client";

import React, { createContext, useEffect, useState } from "react";
import { applicationList } from "../components/applicationList";
import { defaultDashboard } from "../components/defaultDashboard";
import { DashboardGroup } from "../types/DashboardGroup";
import { userDocumentation as userDoc } from "../generatedDocs";
import ApplicationMetadata from "../types/ApplicationMetadata";
import { UserDocumentation } from "../types";

// Create a context for the UserDashboard state
export const ApplicationsContext = createContext<
  [
    DashboardGroup[],
    React.Dispatch<React.SetStateAction<DashboardGroup[]>>,
    ApplicationMetadata[],
    string, // Id of the current application
    React.Dispatch<React.SetStateAction<string>>,
    UserDocumentation,
  ]
>([[], () => {}, [], "", () => {}, userDoc]);

interface ApplicationsProviderProps {
  children: React.ReactNode;
  appList?: ApplicationMetadata[];
  defaultUserDashboard?: DashboardGroup[];
  userDocumentation?: UserDocumentation;
}

/**
 * Provides the applications context to its children components.
 *
 * @param children - The child components to be wrapped by the provider.
 * @param appList - The list of application configurations.
 * @param defaultUserDashboard - The default user dashboard.
 * @param userDocunentation - The user documentation for the applications.
 * @returns The applications provider.
 */
export const ApplicationsProvider = ({
  children,
  appList = applicationList,
  defaultUserDashboard = defaultDashboard,
  userDocumentation,
}: ApplicationsProviderProps) => {
  const loadedDashboard = sessionStorage.getItem("savedDashboard");
  const parsedDashboard: DashboardGroup[] = loadedDashboard
    ? JSON.parse(loadedDashboard)
    : null;

  const [userDashboard, setUserDashboard] = useState<DashboardGroup[]>(
    parsedDashboard || [],
  );

  const [currentAppId, setCurrentAppId] = useState<string>(
    userDashboard[0]?.items[0]?.id || "",
  );

  useEffect(() => {
    if (userDashboard.length !== 0) return;

    setUserDashboard(defaultUserDashboard);
  }, [appList, defaultUserDashboard]);

  // Save the dashboard in session storage
  useEffect(() => {
    sessionStorage.setItem("savedDashboard", JSON.stringify(userDashboard));
  }, [userDashboard]);

  const mergedDocumentation: UserDocumentation = { ...userDoc };

  if (userDocumentation) {
    mergedDocumentation.applications = mergedDocumentation.applications.concat(
      userDocumentation.applications,
    );
    mergedDocumentation.generalUsage =
      userDocumentation.generalUsage || mergedDocumentation.generalUsage;
  }

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
        mergedDocumentation,
      ]}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
