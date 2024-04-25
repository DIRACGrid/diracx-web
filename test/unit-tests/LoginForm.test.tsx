import { render, fireEvent, screen, within } from "@testing-library/react";
import { LoginForm } from "@/components/applications/LoginForm";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useMetadata } from "@/hooks/metadata";

const singleVOMetadata = {
  virtual_organizations: {
    DTeam: {
      groups: {
        admin: {
          properties: ["AdminUser"],
        },
        user: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message: "Please contact system administrator",
        webpage: null,
        email: null,
      },
      default_group: "user",
    },
  },
};

const multiVOMetadata = {
  virtual_organizations: {
    LHCp: {
      groups: {
        user: {
          properties: ["NormalUser"],
        },
        admin: {
          properties: ["AdminUser"],
        },
      },
      support: {
        message: "Please contact the system administrator",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
    PridGG: {
      groups: {
        admin: {
          properties: ["NormalUser"],
        },
      },
      support: {
        message:
          "Please restart your machine, if it still does not work, please try again later",
        webpage: null,
        email: null,
      },
      default_group: "admin",
    },
  },
};

// Mock the necessary hooks and external modules
jest.mock("../../src/hooks/metadata");

jest.mock("../../src/hooks/utils", () => ({
  useDiracxUrl: () => "https://example.com",
}));

jest.mock("@axa-fr/react-oidc", () => ({
  useOidc: () => ({
    login: jest.fn(),
    isAuthenticated: false,
  }),
}));

const params = new URLSearchParams();

jest.mock("next/navigation", () => {
  return {
    usePathname: () => ({
      pathname: "",
    }),
    useRouter: () => ({
      push: jest.fn(),
    }),
    useSearchParams: () => params,
  };
});

describe("LoginForm", () => {
  // Should render a text field to select the VO
  it("renders correctly multiple VOs", () => {
    (useMetadata as jest.Mock).mockReturnValue({ data: multiVOMetadata });

    const { getByText } = render(
      <ThemeProvider>
        <LoginForm />
      </ThemeProvider>,
    );

    // Check the presence of the VO select field (it should not presented as a title since there are multiple VOs)
    // Check the presence of the login button (it should not be present as we have not selected a VO)
    const input = screen
      .getByTestId("autocomplete-vo-select")
      .querySelector("input");
    expect(() => screen.getByTestId("h3-vo-name")).toThrow();
    expect(() => screen.getByTestId("button-login")).toThrow();

    // Simulate typing into the input field (the VO selected does not exist)
    // Check the presence of the login button (it should not be present as the VO does not exist)
    fireEvent.change(input, { target: { value: "Does not exist" } });
    expect(() => screen.getByTestId("button-login")).toThrow();

    // Simulate typing into the input field (partial VO name)
    // Check the presence of the login button (it should be present as the VO exists)
    fireEvent.change(input, { target: { value: "LHC" } });
    fireEvent.click(screen.getByText("LHCp"));

    // Check the presence of the group selector
    expect(screen.getByTestId("select-group")).toBeInTheDocument();

    // Check the presence of the login button (it should be present as the VO exists)
    expect(screen.getByTestId("button-login")).toBeInTheDocument();
  });

  // Should render a title with the VO name
  it("renders correctly single VO", () => {
    (useMetadata as jest.Mock).mockReturnValue({ data: singleVOMetadata });

    const { getByText } = render(
      <ThemeProvider>
        <LoginForm />
      </ThemeProvider>,
    );

    // Check the presence of the VO title
    // The select field should not be presented as a title since there is only one VO
    expect(screen.getByTestId("h3-vo-name")).toBeInTheDocument();
    expect(() => screen.getByTestId("autocomplete-vo-select")).toThrow();

    // Check the presence of the group selector
    expect(screen.getByTestId("select-group")).toBeInTheDocument();

    // Check the presence of the login button (it should be present as the VO exists)
    expect(screen.getByTestId("button-login")).toBeInTheDocument();
  });
});
