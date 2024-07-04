"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NavigationProvider } from "@loxeris/diracx-web-components/contexts";

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
