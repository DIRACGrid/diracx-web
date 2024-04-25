"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import UserDashboard from "@/components/applications/UserDashboard";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { applicationList } from "@/components/applications/ApplicationList";

export default function Page() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  const [sections] = React.useContext(ApplicationsContext);

  const appType = sections
    .find((section) => section.items.some((item) => item.id === appId))
    ?.items.find((item) => item.id === appId)?.type;

  const Component = applicationList.find((app) => app.name === appType)
    ?.component;

  return Component ? <Component /> : <UserDashboard />;
}
