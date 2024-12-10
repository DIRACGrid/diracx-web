"use client";
import React, { useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BaseApp } from "@dirac-grid/diracx-web-components/components";
import { ApplicationsContext } from "@dirac-grid/diracx-web-components/contexts";
import { applicationList } from "@/gubbins/applicationList";

export default function Page() {
  const searchParams = useSearchParams(); // Get and set the search params from the URL
  const appId = searchParams.get("appId"); // Get the appId from the search params

  // Get the user sections from the ApplicationsContext
  const [userDashboard] = useContext(ApplicationsContext);

  // Memoize the application type based on the appId
  const appType = useMemo(() => {
    const section = userDashboard.find((section) =>
      section.items.some((item) => item.id === appId),
    );
    return section?.items.find((item) => item.id === appId)?.type;
  }, [userDashboard, appId]);

  // Get the component based on the application type
  const Component = useMemo(() => {
    return applicationList.find((app) => app.name === appType)?.component;
  }, [appType]);

  // Render the component if it exists, otherwise render the UserDashboard
  return Component ? <Component /> : <BaseApp />;
}
