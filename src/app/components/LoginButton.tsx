import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Avatar, Button } from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import NextLink from "next/link";

/**
 * Login/Logout button, expected to vary whether the user is connected
 * @returns a Button
 */
export function LoginButton() {
  const { accessToken, accessTokenPayload } = useOidcAccessToken();

  if (!accessToken) {
    return (
      <Button component={NextLink} href="/dashboard">
        Login
      </Button>
    );
  }

  return (
    <Button>
      <Avatar sx={{ bgcolor: deepOrange[500] }}>
        {accessTokenPayload["name"][0]}
      </Avatar>
    </Button>
  );
}
