import { useOIDCContext } from "@/hooks/oidcConfiguration";
import { useOidc } from "@axa-fr/react-oidc";
import { Button } from "@mui/material";
import Link from "next/link";

/**
 * Dashboard button, should only appear if user is connected
 * @returns a Button
 */
export function DashboardButton() {
  const { configuration } = useOIDCContext();
  const { isAuthenticated } = useOidc(configuration?.scope);

  // Render null if the OIDC configuration is not ready or no access token is available
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant="contained"
      component={Link}
      href="/dashboard"
      style={{ margin: "3%" }}
    >
      Dashboard
    </Button>
  );
}
