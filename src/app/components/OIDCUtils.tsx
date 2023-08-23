'use client'
import { useRouter } from 'next/navigation';
import { OidcProvider, OidcSecure, useOidcAccessToken } from '@axa-fr/react-oidc';

export function OIDCProvider(props: Props) {
  
  const onEvent = (configurationName: string, eventName: string, data: any) => {
    console.log(`oidc:${configurationName}:${eventName}`, data);
  };

  const withCustomHistory = () => {

    const router = useRouter();

    return {
      replaceState: (url: string) => {
        router.replace({
          pathname: url,
        }).then(() => {
          window.dispatchEvent(new Event('popstate'));
        });
      },
    };
  };

  return (
    <>
      <OidcProvider configuration={props.configuration} onEvent={onEvent} withCustomHistory={withCustomHistory}>
        <main>{props.children}</main>
      </OidcProvider>
    </>
  );
};

export function OIDCSecure({ children }) {
  return (
    <>
      <OidcSecure>
        {children}
      </OidcSecure>
    </>
  );
};

export function OIDCAccessToken() {
  const { accessToken, accessTokenPayload } = useOidcAccessToken();

  if (!accessToken) {
    return <p>You are not authenticated</p>;
  }
  
  return (
    <div className="card text-white bg-info mb-3">
      <div className="card-body">
        <h5 className="card-title">Access Token</h5>
        <p style={{ color: 'red', backgroundColor: 'white' }}>
          Please consider configuring the ServiceWorker to protect your application from XSRF attacks. "access_token" and "refresh_token" will never be accessible from your client-side JavaScript.
        </p>
        <p className="card-text">Access Token: {JSON.stringify(accessToken)}</p>
        {accessTokenPayload != null && <p className="card-text">Access Token Payload: {JSON.stringify(accessTokenPayload)}</p>}
      </div>
    </div>
  );
};


export function OIDCProfile() {
  return (
    <div className="container mt-3">
      <OIDCAccessToken />
    </div>
  );
};
