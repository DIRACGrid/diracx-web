"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import {
  OIDCSecure,
  Dashboard,
} from "@dirac-grid/diracx-web-components/components";
import {
  ApplicationsProvider,
  DiracXWebProviders,
  NavigationProvider,
} from "@dirac-grid/diracx-web-components/contexts";
import { useMUITheme } from "@dirac-grid/diracx-web-components/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { applicationList } from "@/example-extension/applicationList";
import { defaultSections } from "@/example-extension/defaultSections";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMUITheme();

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const customLogoURL =
    "https://mattermost.web.cern.ch/files/oktn8gxjobrb9gwkznx3hx3z7w/public?h=VpJiHpv03q76Pv6KqX90y-dkGxOResdO9xFOa4JsMr4";
  return (
    <DiracXWebProviders
      getPath={() => pathname}
      setPath={(path: string) => {
        router.push(path);
      }}
      getSearchParams={() => searchParams}
    >
      <ApplicationsProvider
        appList={applicationList}
        defaultSections={defaultSections}
      >
        <OIDCSecure>
          <Dashboard logoURL={customLogoURL} drawerWidth={250}>
            <Box
              sx={{
                ml: "5%",
                mr: "5%",
              }}
            >
              {children}
            </Box>
          </Dashboard>
        </OIDCSecure>
      </ApplicationsProvider>
    </DiracXWebProviders>
  );
}
