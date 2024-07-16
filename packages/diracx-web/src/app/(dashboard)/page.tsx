"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import {
  UserDashboard,
  applicationList,
} from "@dirac-grid/diracx-web-components/components";
import { ApplicationsContext } from "@dirac-grid/diracx-web-components/contexts";

export default function Page() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  const [sections] = React.useContext(ApplicationsContext);

  const appType = React.useMemo(() => {
    const section = sections.find((section) =>
      section.items.some((item) => item.id === appId),
    );
    return section?.items.find((item) => item.id === appId)?.type;
  }, [sections, appId]);

  const Component = React.useMemo(() => {
    return applicationList.find((app) => app.name === appType)?.component;
  }, [appType]);

  return Component ? <Component /> : <UserDashboard />;
}
