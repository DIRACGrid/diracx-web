"use client";
import { useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  BaseApp,
  applicationList,
} from "@dirac-grid/diracx-web-components/components";
import { ApplicationsContext } from "@dirac-grid/diracx-web-components/contexts";

export default function Page() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  const [userDashboard] = useContext(ApplicationsContext);

  const appType = useMemo(() => {
    const group = userDashboard.find((group) =>
      group.items.some((item) => item.id === appId),
    );
    return group?.items.find((item) => item.id === appId)?.type;
  }, [userDashboard, appId]);

  const Component = useMemo(() => {
    return applicationList.find((app) => app.name === appType)?.component;
  }, [appType]);

  return Component ? <Component /> : <BaseApp />;
}
