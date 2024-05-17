import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { ThemeToggleButton } from "@/components/ui/ThemeToggleButton";
import { useTheme } from "@/hooks/theme";

// Mocking the useTheme hook
jest.mock("../../src/hooks/theme", () => ({
  useTheme: jest.fn(),
}));

describe("<ThemeToggleButton />", () => {
  let mockToggleTheme: jest.Mock;

  beforeEach(() => {
    mockToggleTheme = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the DarkModeIcon when theme is "light"', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });

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
    (useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      toggleTheme: mockToggleTheme,
    });

    const { getByRole } = render(<ThemeToggleButton />);
    const button = getByRole("button");

    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
