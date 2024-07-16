"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NavigationProvider } from "@dirac-grid/test-lib/contexts";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <NavigationProvider
      getPath={() => pathname}
      setPath={router.push}
      getSearchParams={() => searchParams}
    >
      {children}
    </NavigationProvider>
  );
}
