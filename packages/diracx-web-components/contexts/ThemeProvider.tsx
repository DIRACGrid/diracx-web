"use client";
import { useMediaQuery } from "@mui/material";
import { createContext, useEffect, useState } from "react";

/**
 * Theme context type
 * @property theme - the current theme mode
 * @property toggleTheme - function to toggle the theme mode
 */
type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

/**
 * ThemeProvider props
 */
export type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Theme context
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

/**
 * ThemeProvider component to provide the theme context to its children
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Read the initial theme from localStorage
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const storedTheme = localStorage.getItem("theme");
  const defaultTheme = storedTheme
    ? storedTheme
    : prefersDarkMode
      ? "dark"
      : "light";

  const [theme, setTheme] = useState<string>(defaultTheme);

  // Update localStorage when the theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
