"use client";

import type {
  ApplicationMetadata,
  DashboardGroup,
  UserDocumentation,
} from "../types";

import { OIDCSecure } from "../components";
import {
  OIDCConfigurationProvider,
  ThemeProvider,
  NavigationProvider,
  ApplicationsProvider,
} from "./index";

interface DiracXWebProvidersProps {
  children: React.ReactNode;
  getPath: () => string;
  setPath: (path: string) => void;
  getSearchParams: () => URLSearchParams;
  appList?: ApplicationMetadata[];
  defaultUserDashboard?: DashboardGroup[];
  userDocumentation?: UserDocumentation;
}

export function DiracXWebProviders({
  children,
  getPath,
  setPath,
  getSearchParams,
  appList,
  defaultUserDashboard,
  userDocumentation,
}: DiracXWebProvidersProps) {
  return (
    <OIDCConfigurationProvider>
      <NavigationProvider
        getPath={getPath}
        setPath={setPath}
        getSearchParams={getSearchParams}
      >
        <ApplicationsProvider
          appList={appList}
          defaultUserDashboard={defaultUserDashboard}
          userDocumentation={userDocumentation}
        >
          <ThemeProvider>
            <OIDCSecure>{children}</OIDCSecure>
          </ThemeProvider>
        </ApplicationsProvider>
      </NavigationProvider>
    </OIDCConfigurationProvider>
  );
}
