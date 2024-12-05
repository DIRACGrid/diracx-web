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
}

export function DiracXWebProviders({
  children,
  getPath,
  setPath,
  getSearchParams,
}: DiracXWebProvidersProps) {
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
