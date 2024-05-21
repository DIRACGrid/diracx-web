import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import React, { createContext, useEffect, useState } from "react";
import JSONCrush from "jsoncrush";
import { useOidc } from "@axa-fr/react-oidc";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { applicationList } from "@/components/applications/ApplicationList";
import { UserSection } from "@/types/UserSection";
import { useOIDCContext } from "@/hooks/oidcConfiguration";

// Create a context for the userSections state
export const ApplicationsContext = createContext<
  [UserSection[], React.Dispatch<React.SetStateAction<UserSection[]>>]
>([[], () => {}]);

// Create the ApplicationsProvider component
export const ApplicationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userSections, setSections] = useState<UserSection[]>([]);

  const { getParam, setParam } = useSearchParamsUtils();

  const { configuration } = useOIDCContext();
  const { isAuthenticated } = useOidc(configuration?.scope);

  useEffect(() => {
    // get user sections from searchParams
    const sectionsParams = getParam("sections");
    if (sectionsParams) {
      const uncrushed = JSONCrush.uncrush(sectionsParams);
      try {
        const newSections = JSON.parse(uncrushed).map(
          (section: { items: any[] }) => {
            section.items = section.items.map((item: any) => {
              return {
                ...item,
                //get icon from ApplicationList
                icon: applicationList.find((app) => app.name === item.type)
                  ?.icon,
              };
            });
            return section;
          },
        );
        setSections(newSections);
      } catch (e) {
        console.error("Error parsing user sections : ", uncrushed, e);
      }
    } else {
      setSections([
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
              id: "FileCatatlog0",
              icon: FolderCopy,
            },
          ],
        },
      ]);
    }
  }, [getParam]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    // save user sections to searchParams (but not icons)
    const newSections = userSections.map((section) => {
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
  }, [isAuthenticated, setParam, userSections]);

  return (
    <ApplicationsContext.Provider value={[userSections, setSections]}>
      {children}
    </ApplicationsContext.Provider>
  );
};
