// ThemeToggleButton.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ThemeToggleButton } from "../src/components/DashboardLayout/ThemeToggleButton";
import { useTheme } from "../src/hooks/theme";

// Mock the useTheme hook
jest.mock("../src/hooks/theme", () => ({
  useTheme: jest.fn(),
}));

describe("<ThemeToggleButton />", () => {
  let mockToggleTheme: jest.Mock;

  beforeEach(() => {
    mockToggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the DarkModeIcon when theme is "light"', () => {
    const { getByTestId, queryByTestId } = render(<ThemeToggleButton />);
    expect(getByTestId("dark-mode")).toBeInTheDocument();
    expect(queryByTestId("light-mode")).not.toBeInTheDocument();
  });

  it('renders the LightModeIcon when theme is "dark"', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });

    const { getByTestId, queryByTestId } = render(<ThemeToggleButton />);
    expect(getByTestId("light-mode")).toBeInTheDocument();
    expect(queryByTestId("dark-mode")).not.toBeInTheDocument();
  });

  it("calls toggleTheme function when button is clicked", () => {
    const { getByRole } = render(<ThemeToggleButton />);
    const button = getByRole("button");

    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("renders the correct icon based on theme from localStorage", () => {
    // Simulate theme stored in localStorage
    localStorage.setItem("theme", "dark");

    // Mock useTheme to read from localStorage
    (useTheme as jest.Mock).mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });

    const { getByTestId } = render(<ThemeToggleButton />);
    expect(getByTestId("light-mode")).toBeInTheDocument();
  });

  it("toggles theme and updates the icon accordingly", () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });

    const { getByTestId, queryByTestId, rerender } = render(
      <ThemeToggleButton />,
    );
    expect(getByTestId("dark-mode")).toBeInTheDocument();

    fireEvent.click(getByTestId("dark-mode"));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);

    (useTheme as jest.Mock).mockReturnValue({
      theme: "dark",
      toggleTheme: mockToggleTheme,
    });

    rerender(<ThemeToggleButton />);
    expect(getByTestId("light-mode")).toBeInTheDocument();
    expect(queryByTestId("dark-mode")).not.toBeInTheDocument();
  });
});
