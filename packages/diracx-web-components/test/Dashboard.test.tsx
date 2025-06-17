import { render, fireEvent, waitFor } from "@testing-library/react";
import { composeStories } from "@storybook/react";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import { useMediaQuery } from "@mui/material";
import * as stories from "../stories/Dashboard.stories";
import "@testing-library/jest-dom";

// Compose your Storybook stories (this will include all decorators/args)
const { Default } = composeStories(stories);

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

describe("Dashboard", () => {
  it("renders in desktop mode", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // desktop

    const { getByTestId } = render(<Default />);

    // On desktop, the permanent drawer should be visible
    expect(getByTestId("drawer-permanent")).toBeVisible();

    // The temporary drawer (for mobile) should not be rendered
    expect(() => getByTestId("drawer-temporary")).toThrow();
  });

  it("renders in mobile mode and opens drawer after toggle", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // mobile

    const { getByTestId } = render(<Default />);
    const toggleButton = getByTestId("drawer-toggle-button");

    // Initially, the temporary drawer is not visible
    expect(() => getByTestId("drawer-temporary")).toThrow();

    // Simulate user opening the drawer
    fireEvent.click(toggleButton);

    // Now, the temporary drawer should be visible
    expect(getByTestId("drawer-temporary")).toBeVisible();
  });
});

describe("DashboardDrawer", () => {
  it("renders the app title from the context", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // desktop

    const { getByRole } = render(<Default />);
    expect(getByRole("heading", { name: /App Name/i })).toBeInTheDocument();
  });

  it("shows the context menu when right-clicking on an app item", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // desktop

    const { getByRole, getByTestId } = render(<Default />);
    fireEvent.contextMenu(getByRole("button", { name: /App Name/i }));
    expect(getByTestId("context-menu")).toBeInTheDocument();
  });
});

describe("ApplicationDialog", () => {
  it("renders the Default story with the dialog open", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // desktop

    const { getByTestId, getByRole, getByText } = render(<Default />);

    // Click on "Add Application" button to open the dialog
    const addAppButton = getByTestId("add-application-button");
    fireEvent.click(addAppButton);
    // Check if the dialog is open
    expect(getByRole("dialog")).toBeInTheDocument();
    expect(getByText("Available applications")).toBeInTheDocument();
  });
});

describe("DrawerItem", () => {
  it("renders with the default props", () => {
    const { getByRole } = render(<Default />);

    // Checks for item title
    expect(getByRole("button", { name: /App Name/i })).toBeInTheDocument();
  });
});

describe("DrawerItemGroup", () => {
  it("renders group title", () => {
    const { getByText } = render(<Default />);

    // Check if the group title is rendered
    expect(getByText("Group Title")).toBeInTheDocument();
  });
});

describe("ImportButton", () => {
  it("renders the import button", () => {
    const { getByTestId } = render(<Default />);
    expect(getByTestId("import-button")).toBeInTheDocument();
  });

  it("opens and closes the import dialog", async () => {
    const { getByTestId, queryByTestId } = render(<Default />);

    expect(queryByTestId("import-menu")).not.toBeInTheDocument();

    fireEvent.click(getByTestId("import-button"));
    expect(getByTestId("import-menu")).toBeInTheDocument();

    fireEvent.click(getByTestId("cancel-import-button"));
    await waitFor(() => {
      expect(queryByTestId("import-menu")).not.toBeInTheDocument();
    });
  });

  it("shows error if JSON is invalid", async () => {
    const { getByTestId, getByPlaceholderText, findByText } = render(
      <Default />,
    );
    fireEvent.click(getByTestId("import-button"));

    const textarea = getByPlaceholderText(/paste your application state/i);
    fireEvent.change(textarea, { target: { value: "not valid json" } });
    const importBtn = getByTestId("validate-import-button");
    fireEvent.click(importBtn);
    expect(await findByText(/invalid json format/i)).toBeInTheDocument();

    // Still open
    expect(getByTestId("import-menu")).toBeInTheDocument();
  });

  it("calls onImport and closes dialog when JSON is valid", async () => {
    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <Default />,
    );
    fireEvent.click(getByTestId("import-button"));
    const textarea = getByPlaceholderText(/paste your application state/i);
    // Use valid JSON for ApplicationState
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify([
          { appType: "test", appName: "test", state: "{}" },
        ]),
      },
    });
    // Import should be enabled
    const importBtn = getByTestId("validate-import-button");
    expect(importBtn).not.toBeDisabled();
    fireEvent.click(importBtn);

    // Dialog should close after success
    await waitFor(() => {
      expect(queryByTestId("import-menu")).not.toBeInTheDocument();
    });
  });

  it("disables import button when textarea is empty", () => {
    const { getByTestId } = render(<Default />);
    fireEvent.click(getByTestId("import-button"));
    expect(getByTestId("validate-import-button")).toBeDisabled();
  });
});

describe("ExportButton", () => {
  // Prepare a fake sessionStorage for app state
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the export button with tooltip", () => {
    const { getByTestId } = render(<Default />);
    expect(getByTestId("export-button")).toBeInTheDocument();
  });

  it("opens export menu when button is clicked", () => {
    const { getByTestId } = render(<Default />);
    fireEvent.click(getByTestId("export-button"));
    expect(getByTestId("export-menu")).toBeInTheDocument();
  });

  it("shows app checkboxes and enables export", () => {
    const { getByTestId, getByLabelText, getByRole } = render(<Default />);
    fireEvent.click(getByTestId("export-button"));
    // You should see app/group checkboxes (adjust label as needed)
    expect(getByLabelText(/group title/i)).toBeInTheDocument();
    expect(getByLabelText(/app name/i)).toBeInTheDocument();

    // Select app
    const appCheckbox = getByTestId("checkbox-example");
    fireEvent.click(appCheckbox);

    // Export button should now appear
    expect(
      getByRole("button", { name: /export 1 selected/i }),
    ).toBeInTheDocument();
  });

  it("shows dialog with exported state when exporting", async () => {
    const { getByTestId, getByRole, getByText, findByRole } = render(
      <Default />,
    );
    fireEvent.click(getByTestId("export-button"));

    // Select app
    const appCheckbox = getByTestId("checkbox-example");
    fireEvent.click(appCheckbox);

    fireEvent.click(getByRole("button", { name: /export 1 selected/i }));

    // Dialog with Application State should open
    expect(await findByRole("dialog")).toBeInTheDocument();
    expect(getByText(/application state/i)).toBeInTheDocument();

    // State JSON should be visible
    expect(getByText(/"App Name"/)).toBeInTheDocument();
  });

  it("copies to clipboard and closes dialog", async () => {
    const { getByTestId, getByRole, queryByRole } = render(<Default />);
    fireEvent.click(getByTestId("export-button"));
    const appCheckbox = getByTestId("checkbox-example");
    fireEvent.click(appCheckbox);
    fireEvent.click(getByRole("button", { name: /export 1 selected/i }));

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    // Click copy
    const copyBtn = await getByTestId("validate-export-button");
    fireEvent.click(copyBtn);

    // Dialog should close
    await waitFor(() => expect(queryByRole("dialog")).not.toBeInTheDocument());
    // Clipboard should have been called
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("can close dialog with cancel", async () => {
    const { getByTestId, getByRole, queryByRole } = render(<Default />);
    fireEvent.click(getByTestId("export-button"));
    const appCheckbox = getByTestId("checkbox-example");
    fireEvent.click(appCheckbox);
    fireEvent.click(getByRole("button", { name: /export 1 selected/i }));

    const cancelBtn = await getByTestId("cancel-export-button");
    fireEvent.click(cancelBtn);

    await waitFor(() => expect(queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("toggles theme and updates the icon accordingly", () => {
    const { getByTestId, queryByTestId } = render(<Default />);
    expect(getByTestId("dark-mode")).toBeInTheDocument();
    expect(queryByTestId("light-mode")).not.toBeInTheDocument();

    fireEvent.click(getByTestId("theme-toggle-button"));

    expect(getByTestId("light-mode")).toBeInTheDocument();
    expect(queryByTestId("dark-mode")).not.toBeInTheDocument();
  });

  it("renders the correct icon based on theme from sessionStorage", () => {
    // Simulate theme stored in localStorage
    sessionStorage.setItem("theme", "dark");

    const { getByTestId } = render(<Default />);
    expect(getByTestId("light-mode")).toBeInTheDocument();

    fireEvent.click(getByTestId("theme-toggle-button"));

    expect(getByTestId("dark-mode")).toBeInTheDocument();
  });

  it("uses system light mode preference when no theme in sessionStorage", () => {
    // Simulate system preference = light mode
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    const { getByTestId, queryByTestId } = render(<Default />);

    // When system prefers light mode, "dark-mode" icon should be shown
    expect(getByTestId("dark-mode")).toBeInTheDocument();
    expect(queryByTestId("light-mode")).not.toBeInTheDocument();

    // Verify sessionStorage was updated to match system preference
    expect(sessionStorage.getItem("theme")).toBe("light");
  });

  it("prioritizes sessionStorage theme over system preference", () => {
    // System prefers light mode
    (useMediaQuery as jest.Mock).mockReturnValue(false);

    // But sessionStorage has dark theme
    sessionStorage.setItem("theme", "dark");

    const { getByTestId } = render(<Default />);

    // Should show light-mode icon (for dark theme) despite system preferring light
    expect(getByTestId("light-mode")).toBeInTheDocument();
  });
});

describe("ProfileButton", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders "Login" button when not authenticated', () => {
    (useOidc as jest.Mock).mockReturnValue({ isAuthenticated: false });
    (useOidcAccessToken as jest.Mock).mockReturnValue({});

    const { getByTestId } = render(<Default />);
    expect(getByTestId("login-button")).toBeInTheDocument();
  });

  it("renders user avatar with initial and opens menu when authenticated", () => {
    (useOidc as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    });
    (useOidcAccessToken as jest.Mock).mockReturnValue({
      accessToken: "mockAccessToken",
      accessTokenPayload: {
        preferred_username: "Maria",
        vo: "dirac",
        dirac_group: "group1",
        dirac_properties: ["Prop1", "Prop2"],
      },
    });

    const { getByText, getByTestId } = render(<Default />);
    // Avatar shows first letter
    expect(getByText("M")).toBeInTheDocument();

    // Open the menu
    fireEvent.click(getByTestId("profile-button"));

    // All profile fields should be visible
    expect(getByText("Maria")).toBeInTheDocument();
    expect(getByText("dirac")).toBeInTheDocument();
    expect(getByText("group1")).toBeInTheDocument();
    expect(getByText("Properties")).toBeInTheDocument();
    expect(getByText("About")).toBeInTheDocument();
    expect(getByText("Logout")).toBeInTheDocument();

    // Expand properties
    fireEvent.click(getByText("Properties"));
    expect(getByText("Prop1")).toBeInTheDocument();
    expect(getByText("Prop2")).toBeInTheDocument();
  });
});
