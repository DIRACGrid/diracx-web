"use client";
import { useOidcAccessToken } from "@axa-fr/react-oidc/";
import { useOIDCContext } from "@/hooks/oidcConfiguration";

/**
 * Build the User Dashboard page
 *
 * @returns User Dashboard content
 */
export default function BaseApplication() {
  const { configuration } = useOIDCContext();
  const { accessTokenPayload } = useOidcAccessToken(configuration?.scope);

  if (!accessTokenPayload) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h2>Hello {accessTokenPayload["preferred_username"]}</h2>

      <p>To start with, select an application in the side bar</p>
    </div>
  );
}
