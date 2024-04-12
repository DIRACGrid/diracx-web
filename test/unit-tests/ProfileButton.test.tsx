import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { useOidcAccessToken, useOidc } from "@axa-fr/react-oidc";
import { ProfileButton } from "@/components/ui/ProfileButton";
import { OIDCConfigurationContext } from "@/contexts/OIDCConfigurationProvider";

// Mocking the hooks
jest.mock("@axa-fr/react-oidc");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("<ProfileButton />", () => {
  it('displays the "Login" button when not authenticated', () => {
    (useOidc as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useOidcAccessToken as jest.Mock).mockReturnValue({});

    const { getByText } = render(<ProfileButton />);
    expect(getByText("Login")).toBeInTheDocument();
  });

  it("displays the user avatar when authenticated", () => {
    (useOidc as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessToken: "mockAccessToken",
      accessTokenPayload: { preferred_username: "John" },
    });

    const { getByText } = render(<ProfileButton />);
    expect(getByText("J")).toBeInTheDocument(); // Assuming 'John' is the preferred username and 'J' is the first letter.
  });

  it("opens the menu when avatar is clicked", () => {
    (useOidc as jest.Mock).mockReturnValue({ isAuthenticated: true });
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessToken: "mockAccessToken",
      accessTokenPayload: { preferred_username: "John" },
    });

    const { getByText, queryByText } = render(<ProfileButton />);
    fireEvent.click(getByText("J"));
    expect(queryByText("Profile")).toBeInTheDocument();
    expect(queryByText("Logout")).toBeInTheDocument();
  });

  it('calls the logout function when "Logout" is clicked', () => {
    const mockLogout = jest.fn();

    (useOidc as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessTokenPayload: { preferred_username: "John" },
    });

    // Mock context value
    const mockContextValue = {
      configuration: { scope: "mockScope" },
      setConfiguration: jest.fn(),
    };

    const { getByText } = render(
      <OIDCConfigurationContext.Provider value={mockContextValue}>
        <ProfileButton />
      </OIDCConfigurationContext.Provider>,
    );

    // Open the menu by clicking the avatar
    fireEvent.click(getByText("J"));

    // Click the "Logout" option
    fireEvent.click(getByText("Logout"));

    // Ensure the mockLogout function was called
    expect(mockLogout).toHaveBeenCalled();
  });
});
