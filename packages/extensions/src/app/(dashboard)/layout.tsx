"use client";
import React from "react";
import { Box } from "@mui/material";
import { Dashboard } from "@dirac-grid/diracx-web-components/components";
import { DiracXWebProviders } from "@dirac-grid/diracx-web-components/contexts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { userDocumentation } from "../../generatedDocs";
import { applicationList } from "@/gubbins/applicationList";
import { defaultSections } from "@/gubbins/DefaultUserDashboard";

// Layout for the dashboard: setup the providers and the dashboard for the applications
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the pathname, router and search params from the next/navigation package, needed for navigation and routing
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // A custom logo URL can be used for the dashboard
  const customLogoURL = "/robot.png";
  return (
    // DiracXWebProviders is the main provider for the DiracX Web components, you need to give it the pathname, router and search params
    <DiracXWebProviders
      getPath={() => pathname}
      setPath={router.push}
      getSearchParams={() => searchParams}
      // You can optionally pass a list of applications and a default user dashboard
      appList={applicationList}
      defaultUserDashboard={defaultSections}
      userDocumentation={userDocumentation}
    >
      {/* Dashboard is the main layout for the applications, you can optionally give it a custom logo URL and a drawer width */}
      <Dashboard logoURL={customLogoURL} drawerWidth={250}>
        <Box
          sx={{
            ml: "1%",
            mr: "1%",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Dashboard>
    </DiracXWebProviders>
  );
}
