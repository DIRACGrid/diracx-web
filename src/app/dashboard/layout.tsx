import React from "react";
import Dashboard from "@/components/layout/Dashboard";
import { OIDCSecure } from "@/components/layout/OIDCSecure";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <OIDCSecure>
        <Dashboard>{children}</Dashboard>
      </OIDCSecure>
    </div>
  );
}
