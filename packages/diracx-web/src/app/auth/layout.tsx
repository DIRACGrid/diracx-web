"use client";
import React from "react";
import { DiracXWebProviders } from "@dirac-grid/test-lib/contexts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <DiracXWebProviders
      getPath={() => pathname}
      setPath={(path: string) => {
        router.push(path);
      }}
      getSearchParams={() => searchParams}
    >
      {children}
    </DiracXWebProviders>
  );
}
