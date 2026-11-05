import { Box } from "@mui/material";
import {
  ErrorBox,
  LoginForm,
  Dashboard,
  ApplicationSelector,
} from "@dirac-grid/diracx-web-components/components";
import { DiracXWebProviders } from "@dirac-grid/diracx-web-components/contexts";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useBrowserNavigation } from "./useBrowserNavigation";
import { applicationList } from "@/gubbins/applicationList";
import { defaultSections } from "@/gubbins/DefaultUserDashboard";

const logoURL = "/robot.png";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return <ErrorBox msg={message} reset={resetErrorBoundary} />;
}

export default function App() {
  const { getPath, setPath, getSearchParams } = useBrowserNavigation();
  const isAuthRoute = getPath().startsWith("/auth");

  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      {/* You can optionally pass a list of applications and a default user dashboard */}
      <DiracXWebProviders
        getPath={getPath}
        setPath={setPath}
        getSearchParams={getSearchParams}
        appList={applicationList}
        defaultUserDashboard={defaultSections}
      >
        {isAuthRoute ? (
          <LoginForm logoURL={logoURL} />
        ) : (
          <section>
            {/* Dashboard is the main layout for the applications, you can optionally give it a custom logo URL and a drawer width */}
            <Dashboard logoURL={logoURL} drawerWidth={250}>
              <Box
                sx={{
                  ml: "1%",
                  mr: "1%",
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  overflow: "hidden",
                }}
              >
                <ApplicationSelector />
              </Box>
            </Dashboard>
          </section>
        )}
      </DiracXWebProviders>
    </ErrorBoundary>
  );
}
