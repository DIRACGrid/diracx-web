import React from "react";
import DashboardAppBar from "@/components/layout/DashboardAppBar";
import { OIDCSecure } from "@/components/auth/OIDCUtils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <OIDCSecure>
        <DashboardAppBar>{children}</DashboardAppBar>
      </OIDCSecure>
    </div>
  );
}
