"use client";
import React, { useEffect } from "react";
import { BaseApp } from "@dirac-grid/diracx-web-components/components";
import { ApplicationsContext } from "@dirac-grid/diracx-web-components/contexts";
import { useSearchParamsUtils } from "@dirac-grid/diracx-web-components/hooks";
import { applicationList } from "@/gubbins/applicationList";

export default function Page() {
  const { getParam, setParam } = useSearchParamsUtils(); // Get and set the search params from the URL
  const appId = getParam("appId"); // Get the appId from the search params

  // You can set a default appId if it's not provided using useEffect
  useEffect(() => {
    if (!getParam("appId")) {
      setParam("appId", "Test App 1");
    }
  }, [getParam, setParam]);

  // Get the user dashboard from the ApplicationsContext
  const [userDashboard] = React.useContext(ApplicationsContext);

  // Memoize the application type based on the appId
  const appType = React.useMemo(() => {
    const group = userDashboard.find((group) =>
      group.items.some((item) => item.id === appId),
    );
    return group?.items.find((item) => item.id === appId)?.type;
  }, [userDashboard, appId]);

  // Get the component based on the application type
  const Component = React.useMemo(() => {
    return applicationList.find((app) => app.name === appType)?.component;
  }, [appType]);

  // Render the component if it exists, otherwise render the BaseApp
  return Component ? <Component /> : <BaseApp />;
}
