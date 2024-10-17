import {
  OIDCConfigurationProvider,
  ThemeProvider,
  NavigationProvider,
  ApplicationsProvider,
} from "./index";

export function DiracXWebProviders({
  children,
  getPath,
  setPath,
  getSearchParams,
}: {
  children: React.ReactNode;
  getPath: () => string;
  setPath: (path: string) => void;
  getSearchParams: () => URLSearchParams;
}) {
  return (
    <OIDCConfigurationProvider>
      <NavigationProvider
        getPath={getPath}
        setPath={setPath}
        getSearchParams={getSearchParams}
      >
        <ApplicationsProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ApplicationsProvider>
      </NavigationProvider>
    </OIDCConfigurationProvider>
  );
}
