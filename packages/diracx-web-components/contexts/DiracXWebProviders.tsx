import { CssBaseline, ThemeProvider as MUIThemeProvider } from "@mui/material";
import { useMUITheme } from "../hooks/theme";
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
      <ThemeProvider>
        <NavigationProvider
          getPath={getPath}
          setPath={setPath}
          getSearchParams={getSearchParams}
        >
          <ApplicationsProvider>
            <MUIProviders>{children}</MUIProviders>
          </ApplicationsProvider>
        </NavigationProvider>
      </ThemeProvider>
    </OIDCConfigurationProvider>
  );
}

function MUIProviders({ children }: { children: React.ReactNode }) {
  const theme = useMUITheme();
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
