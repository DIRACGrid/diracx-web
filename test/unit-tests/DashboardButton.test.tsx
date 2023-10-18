import React from "react";
import { render } from "@testing-library/react";
import { DashboardButton } from "@/components/ui/DashboardButton";
import { useOidcAccessToken } from "@axa-fr/react-oidc";

// Mocking the useOidcAccessToken hook
jest.mock("@axa-fr/react-oidc", () => ({
  useOidcAccessToken: jest.fn(),
}));

describe("<DashboardButton />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the button when user is connected (has accessToken)", () => {
    // Mocking the return value of useOidcAccessToken to simulate a user with an accessToken
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessToken: "mocked_token",
    });

    const { getByText } = render(<DashboardButton />);
    const button = getByText("Dashboard");

    expect(button).toBeInTheDocument();
  });

  it("does not render the button when user is not connected (no accessToken)", () => {
    // Mocking the return value of useOidcAccessToken to simulate a user without an accessToken
    (useOidcAccessToken as jest.Mock).mockReturnValue({ accessToken: null });

    const { queryByText } = render(<DashboardButton />);
    const button = queryByText("Dashboard");

    expect(button).not.toBeInTheDocument();
  });
});
