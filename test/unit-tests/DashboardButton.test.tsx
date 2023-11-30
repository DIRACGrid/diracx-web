import React from "react";
import { render } from "@testing-library/react";
import { DashboardButton } from "@/components/ui/DashboardButton";
import { useOidc } from "@axa-fr/react-oidc";

// Mocking the useOidcAccessToken hook
jest.mock("@axa-fr/react-oidc", () => ({
  useOidc: jest.fn(),
}));

describe("<DashboardButton />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the button when user is connected (isAuthenticated = true)", () => {
    // Mocking the return value of useOidcAccessToken to simulate a non-connected user
    (useOidc as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    const { getByText } = render(<DashboardButton />);
    const button = getByText("Dashboard");

    expect(button).toBeInTheDocument();
  });

  it("does not render the button when user is not connected (no accessToken)", () => {
    // Mocking the return value of useOidc to simulate a connected user
    (useOidc as jest.Mock).mockReturnValue({ isAuthenticated: false });

    const { queryByText } = render(<DashboardButton />);
    const button = queryByText("Dashboard");

    expect(button).not.toBeInTheDocument();
  });
});
