"use client";
import { OidcProvider, OidcSecure } from "@axa-fr/react-oidc";

/**
 * Wrapper around the react-oidc OidcProvider component
 * Needed because OidcProvider cannot be directly called from a server file
 * @param props - configuration of the OIDC provider
 * @returns the wrapper around OidcProvider
 */
export function OIDCProvider(props: Props) {
  const onEvent = (configurationName: string, eventName: string, data: any) => {
    console.log(`oidc:${configurationName}:${eventName}`, data);
  };

  const withCustomHistory = () => {
    return {
      replaceState: (url: string) => {
        // Cannot use router.replace() because the code is not adapted to NextJS 13 yet
        window.location.href = url;
      },
    };
  };

  return (
    <>
      <OidcProvider
        configuration={props.configuration}
        onEvent={onEvent}
        withCustomHistory={withCustomHistory}
      >
        <main>{props.children}</main>
      </OidcProvider>
    </>
  );
}

/**
 * Wrapper around the react-oidc OidcSecure component
 * Needed because OidcProvider cannot be directly called from a server file
 * @param props - configuration of the OIDC provider
 * @returns the wrapper around OidcProvider
 */
export function OIDCSecure({ children }) {
  return (
    <>
      <OidcSecure>{children}</OidcSecure>
    </>
  );
}
