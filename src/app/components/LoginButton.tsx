import { useOidcAccessToken } from "@axa-fr/react-oidc";
import { Avatar, Button } from "@mui/material";
import { deepOrange, lightGreen } from "@mui/material/colors";
import NextLink from "next/link";

/**
 * Login/Logout button, expected to vary whether the user is connected
 * @returns a Button
 */
export function LoginButton() {
  const { accessToken, accessTokenPayload } = useOidcAccessToken();

  if (!accessToken) {
    return (
      <Button
        sx={{
          bgcolor: lightGreen[700],
          "&:hover": { bgcolor: deepOrange[500] },
        }}
        variant="contained"
        component={NextLink}
        href="/dashboard"
      >
        Login
      </Button>
    );
  }

  return (
    <Button>
      <Avatar sx={{ bgcolor: deepOrange[500] }}>
        {accessTokenPayload["preferred_username"][0]}
      </Avatar>
    </Button>
  );
}
