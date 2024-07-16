"use client";
import React from "react";
import { Box } from "@mui/material";
import { DiracXWebProviders } from "@dirac-grid/test-lib/contexts";
import { OIDCSecure, Dashboard } from "@dirac-grid/test-lib/components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <section>
      <DiracXWebProviders
        getPath={() => pathname}
        setPath={(path: string) => {
          router.push(path);
        }}
        getSearchParams={() => searchParams}
      >
        <OIDCSecure>
          <Dashboard>
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
      </DiracXWebProviders>
    </section>
  );
}
