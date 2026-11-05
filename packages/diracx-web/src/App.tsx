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

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return <ErrorBox msg={message} reset={resetErrorBoundary} />;
}

export default function App() {
  const { getPath, setPath, getSearchParams } = useBrowserNavigation();
  const isAuthRoute = getPath().startsWith("/auth");

  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <DiracXWebProviders
        getPath={getPath}
        setPath={setPath}
        getSearchParams={getSearchParams}
      >
        {isAuthRoute ? (
          <LoginForm />
        ) : (
          <section>
            <Dashboard>
              <Box
                sx={{
                  ml: "1%",
                  mr: "1%",
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  overflow: "auto",
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
