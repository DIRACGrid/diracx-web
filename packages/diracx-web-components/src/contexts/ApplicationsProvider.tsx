import React, { createContext, useCallback, useEffect, useState } from "react";
import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import JSONCrush from "jsoncrush";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { applicationList } from "@/components/applications/ApplicationList";
import { UserSection } from "@/types/UserSection";
import ApplicationConfig from "@/types/ApplicationConfig";

// Create a context for the userSections state
export const ApplicationsContext = createContext<
  [
    UserSection[],
    React.Dispatch<React.SetStateAction<UserSection[]>>,
    ApplicationConfig[],
  ]
>([[], () => {}, []]);

/**
 * Provides the applications context to its children components.
 *
 * @param children - The child components to be wrapped by the provider.
 * @param appList - The list of application configurations.
 * @param defaultSections - The default user sections.
 * @returns The applications provider.
 */
export const ApplicationsProvider = ({
  children,
  appList = applicationList,
  defaultSections,
}: {
  children: React.ReactNode;
  appList?: ApplicationConfig[];
  defaultSections?: UserSection[];
}) => {
  const [userSections, setSections] = useState<UserSection[]>([]);

  const { getParam, setParam } = useSearchParamsUtils();

  // get user sections from searchParams
  const sectionsParams = getParam("sections");

  // save user sections to searchParams (but not icons)
  const setSectionsParams = useCallback(
    (sections: UserSection[] | ((prev: UserSection[]) => UserSection[])) => {
      if (typeof sections === "function") {
        sections = sections(userSections);
      }
      const newSections = sections.map((section) => {
        return {
          ...section,
          items: section.items.map((item) => {
            return {
              ...item,
              icon: () => null,
            };
          }),
        };
      });
      setParam("sections", JSONCrush.crush(JSON.stringify(newSections)));
    },
    [setParam, userSections],
  );

  useEffect(() => {
    if (userSections.length !== 0) return;
    if (sectionsParams) {
      const uncrushed = JSONCrush.uncrush(sectionsParams);
      try {
        const newSections = JSON.parse(uncrushed).map(
          (section: { items: any[] }) => {
            section.items = section.items.map((item: any) => {
              return {
                ...item,
                //get icon from appList
                icon: appList.find((app) => app.name === item.type)?.icon,
              };
            });
            return section;
          },
        );
        if (newSections !== userSections) {
          setSections(newSections);
        }
      } catch (e) {
        console.error("Error parsing user sections : ", uncrushed, e);
      }
    } else {
      setSections(
        defaultSections || [
          {
            title: "Dashboard",
            extended: true,
            items: [
              {
                title: "Dashboard",
                type: "Dashboard",
                id: "Dashboard0",
                icon: Dashboard,
              },
              {
                title: "Job Monitor",
                type: "Job Monitor",
                id: "JobMonitor0",
                icon: Monitor,
              },
            ],
          },
          {
            title: "Other",
            extended: false,
            items: [
              {
                title: "File Catalog",
                type: "File Catalog",
                id: "FileCatalog0",
                icon: FolderCopy,
              },
            ],
          },
        ],
      );
    }
  }, [appList, defaultSections, sectionsParams]);

  return (
    <ApplicationsContext.Provider
      value={[
        userSections,
        (section) => {
          setSections(section);
          setSectionsParams(section);
        },
        appList,
      ]}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};
