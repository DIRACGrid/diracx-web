import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Button } from "@mui/material";
import { deepOrange, lightGreen } from "@mui/material/colors";
import Link from "next/link";

/**
 * Dashboard button, should only appear if user is connected
 * @returns a Button
 */
export function DashboardButton() {
  const { accessToken } = useOidcAccessToken();

  if (!accessToken) {
    return null;
  }

  return (
    <Button variant="outlined" component={Link} href="/dashboard">
      Dashboard
    </Button>
  );
}
