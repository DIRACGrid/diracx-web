"use client";

import React, {
  createContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import { Monitor } from "@mui/icons-material";
import JSONCrush from "jsoncrush";
import { useSearchParamsUtils } from "../hooks/searchParamsUtils";
import { applicationList } from "../components/ApplicationList";
import { DashboardGroup } from "../types/DashboardGroup";
import ApplicationMetadata from "../types/ApplicationMetadata";
import { DashboardItem } from "../types/DashboardItem";

// Create a context for the UserDashboard state
export const ApplicationsContext = createContext<
  [
    DashboardGroup[],
    React.Dispatch<React.SetStateAction<DashboardGroup[]>>,
    ApplicationMetadata[],
  ]
>([[], () => {}, []]);

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
  const [userDashboard, setUserDashboard] = useState<DashboardGroup[]>([]);

  const { getParam, setParam } = useSearchParamsUtils();

  // save user dashboard to searchParams (but not icons)
  const setUserDashboardParams = useCallback(
    (
      groups: DashboardGroup[] | ((prev: DashboardGroup[]) => DashboardGroup[]),
    ) => {
      if (typeof groups === "function") {
        groups = groups(userDashboard);
      }
      const newSections = groups.map((group) => {
        return {
          ...group,
          items: group.items.map((item) => {
            return {
              ...item,
              icon: () => null,
            };
          }),
        };
      });
      setParam("dashboard", JSONCrush.crush(JSON.stringify(newSections)));
    },
    [setParam, userDashboard],
  );

  // get user sections from searchParams
  const groupsParams = useMemo(() => getParam("dashboard"), [getParam]);

  useEffect(() => {
    if (userDashboard.length !== 0) return;
    if (groupsParams) {
      const uncrushed = JSONCrush.uncrush(groupsParams);
      try {
        const newSections: DashboardGroup[] = JSON.parse(uncrushed).map(
          (group: DashboardGroup) => {
            group.items = group.items.map((item: DashboardItem) => {
              return {
                ...item,
                //get icon from appList
                icon:
                  appList.find((app) => app.name === item.type)?.icon || null,
              };
            });
            return group;
          },
        );
        if (newSections !== userDashboard) {
          setUserDashboard(newSections);
        }
      } catch (e) {
        console.error("Error parsing user dashboard : ", uncrushed, e);
      }
    } else {
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
                icon: Monitor,
              },
            ],
          },
        ],
      );
    }
  }, [appList, defaultUserDashboard, groupsParams]);

  return (
    <ApplicationsContext.Provider
      value={[
        userDashboard,
        (group) => {
          setUserDashboard(group);
          setUserDashboardParams(group);
        },
        appList,
      ]}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
