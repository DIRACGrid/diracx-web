"use client";
import React from "react";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMUITheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <section>
      <NavigationProvider
        getPath={() => pathname}
        setPath={(path: string) => {
          router.push(path);
        }}
        getSearchParams={() => searchParams}
      >
        <ApplicationsProvider>
          <OIDCSecure>
            <Dashboard>
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
