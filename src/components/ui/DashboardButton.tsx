import { useOIDCContext } from "@/hooks/oidcConfiguration";
import { useOidc } from "@axa-fr/react-oidc";
import { Button } from "@mui/material";
import { deepOrange, lightGreen } from "@mui/material/colors";
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
      sx={{
        bgcolor: lightGreen[700],
        "&:hover": { bgcolor: deepOrange[500] },
      }}
      component={Link}
      href="/dashboard"
    >
      Dashboard
    </Button>
  );
}
