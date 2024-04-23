import { Dashboard, FolderCopy, Monitor } from "@mui/icons-material";
import React, { createContext, useEffect, useState } from "react";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { applicationList } from "@/components/applications/ApplicationList";
import { UserSection } from "@/types/UserSection";

// Create a context for the userSections state
export const ApplicationsContext = createContext<
  [UserSection[], React.Dispatch<React.SetStateAction<UserSection[]>>]
>([[], () => {}]);

// Create the ApplicationsProvider component
const ApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userSections, setSections] = useState<UserSection[]>([
    {
      title: "Dashboard",
      extended: true,
      items: [
        {
          title: "Dashboard",
          type: "Dashboard",
          id: "Dashboard0",
          icon: Dashboard,
          path: "/",
        },
        {
          title: "Job Monitor",
          type: "Job Monitor",
          id: "JobMonitor0",
          icon: Monitor,
          path: "/jobmonitor",
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
          path: "/filecatalog",
        },
      ],
    },
  ]);
  const { getParam, setParam } = useSearchParamsUtils();

  useEffect(() => {
    // get user sections from searchParams
    const sectionsParams = getParam("sections");
    if (sectionsParams) {
      const newSections = JSON.parse(sectionsParams).map(
        (section: { items: any[] }) => {
          section.items = section.items.map((item: any) => {
            return {
              ...item,
              //get icon from ApplicationList
              icon: applicationList.find((app) => app.name === item.type)?.icon,
            };
          });
          return section;
        },
      );
      setSections(newSections);
    }
  }, [getParam]);

  useEffect(() => {
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
    setParam("sections", JSON.stringify(newSections));
    console.log(JSON.stringify(newSections));
  }, [setParam, userSections]);

  return (
    <ApplicationsContext.Provider value={[userSections, setSections]}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export default ApplicationsProvider;
