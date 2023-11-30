"use client";
import { useMediaQuery } from "@mui/material";
import { createContext, useState } from "react";

/**
 * Theme context type
 * @property theme - the current theme mode
 * @property toggleTheme - function to toggle the theme mode
 */
type ThemeContextType = {
  theme: "light" | "dark";
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
  // State to manage the current theme mode
  const [theme, setTheme] = useState<"light" | "dark">(
    useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light",
  );

  // Function to toggle the theme mode
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
