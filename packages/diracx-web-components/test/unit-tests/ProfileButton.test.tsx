import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  useOidcAccessToken,
  useOidc,
  OidcConfiguration,
} from "@axa-fr/react-oidc";
import { ProfileButton } from "@/components/DashboardLayout/ProfileButton";
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
      accessTokenPayload: {
        preferred_username: "John",
        vo: "DiracVO",
        dirac_group: "dirac_user",
        dirac_properties: ["NormalUser"],
      },
    });

    const { getByText, queryByText } = render(<ProfileButton />);
    fireEvent.click(getByText("J"));

    expect(queryByText("John")).toBeInTheDocument();
    expect(queryByText("DiracVO")).toBeInTheDocument();
    expect(queryByText("dirac_user")).toBeInTheDocument();
    expect(queryByText("Properties")).toBeInTheDocument();
    expect(queryByText("About")).toBeInTheDocument();
    expect(queryByText("Logout")).toBeInTheDocument();

    // Open the "Properties" section
    fireEvent.click(getByText("Properties"));

    // Ensure the "NormalUser" property is displayed within the "Properties" section
    expect(queryByText("NormalUser")).toBeInTheDocument();
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
      configuration: {
        scope: "fake_scope",
        client_id: "fake_id",
        redirect_uri: "fake_uri",
        authority: "fake_authority",
      } as OidcConfiguration,
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
