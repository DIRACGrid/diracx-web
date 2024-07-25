"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NavigationProvider } from "@dirac-grid/diracx-web-components/contexts";

// Layout for the authentication page: setup the navigation provider
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the pathname, router and search params from the next/navigation package, needed for navigation and routing
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    // NavigationProvider is the provider for the DiracX Web Navigation, you need to give it the pathname, router and search params
    <NavigationProvider
      getPath={() => pathname}
      setPath={router.push}
      getSearchParams={() => searchParams}
    >
      {children}
    </NavigationProvider>
  );
}
