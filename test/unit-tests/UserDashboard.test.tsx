import React from "react";
import { render } from "@testing-library/react";
import UserDashboard from "@/components/applications/UserDashboard";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useOIDCContext, useOidcAccessToken } from "@axa-fr/react-oidc";

jest.mock("@axa-fr/react-oidc", () => ({
  useOIDCContext: jest.fn(),
  useOidcAccessToken: jest.fn(),
}));

describe("<UserDashboard />", () => {
  it("renders not authenticated message when accessTokenPayload is not defined", () => {
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessTokenPayload: null,
    });

    const { getByText } = render(
      <ThemeProvider>
        <UserDashboard />
      </ThemeProvider>,
    );
    expect(getByText("Not authenticated")).toBeInTheDocument();
  });

  it("renders welcome message when accessTokenPayload is defined", () => {
    (useOIDCContext as jest.Mock).mockReturnValue({
      configuration: { scope: "openid" },
    });
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessTokenPayload: { preferred_username: "TestUser" },
    });

    const { getByText } = render(
      <ThemeProvider>
        <UserDashboard />
      </ThemeProvider>,
    );
    expect(getByText("Hello TestUser")).toBeInTheDocument();
  });
});
