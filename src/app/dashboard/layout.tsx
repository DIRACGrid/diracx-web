import React from "react";
import DashboardAppBar from "@/components/DashboardAppBar";
import { OIDCSecure } from "@/components/OIDCUtils";

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
