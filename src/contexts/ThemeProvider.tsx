"use client";
import { createContext, useState } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

// ThemeProvider component to provide the theme context to its children
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // State to manage the current theme mode
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
