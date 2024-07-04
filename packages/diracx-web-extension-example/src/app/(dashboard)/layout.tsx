"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import {
  OIDCSecure,
  Dashboard,
} from "@loxeris/diracx-web-components/components";
import {
  ApplicationsProvider,
  NavigationProvider,
} from "@loxeris/diracx-web-components/contexts";
import { useMUITheme } from "@loxeris/diracx-web-components/hooks";
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
    "https://raw.githubusercontent.com/DIRACGrid/management/81ba3d4ccc763d1d4b58878cbe6957f894c1576f/branding/diracx/svg/diracx-logo-full.svg";
  return (
    <section>
      <NavigationProvider
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
              <MUIThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                  sx={{
                    ml: "5%",
                    mr: "5%",
                  }}
                >
                  {children}
                </Box>
              </MUIThemeProvider>
            </Dashboard>
          </OIDCSecure>
        </ApplicationsProvider>
      </NavigationProvider>
    </section>
  );
}
