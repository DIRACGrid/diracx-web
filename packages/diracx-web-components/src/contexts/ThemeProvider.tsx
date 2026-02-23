"use client";

import {
  CssBaseline,
  ThemeProvider as MUIThemeProvider,
  createTheme,
  getContrastRatio,
  lighten,
  darken,
  alpha,
  PaletteMode,
  useMediaQuery,
} from "@mui/material";
import { cyan, grey, lightGreen } from "@mui/material/colors";
import { createContext, useMemo, useState } from "react";

declare module "@mui/material/styles" {
  interface Palette {
    tableRow: {
      even: string;
      odd: string;
    };
  }
  interface PaletteOptions {
    tableRow: {
      even: string;
      odd: string;
    };
  }
}

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
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState<string | null>(null);
  const [prevPrefersDark, setPrevPrefersDark] = useState(prefersDarkMode);

  // Initialize theme from sessionStorage or system preference
  if (theme === null) {
    const storedTheme =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("theme")
        : null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const defaultTheme = prefersDarkMode ? "dark" : "light";
      setTheme(defaultTheme);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("theme", defaultTheme);
      }
    }
  }

  // Update theme when system preference changes
  if (prevPrefersDark !== prefersDarkMode) {
    setPrevPrefersDark(prefersDarkMode);
    const storedTheme =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("theme")
        : null;
    if (!storedTheme) {
      const defaultTheme = prefersDarkMode ? "dark" : "light";
      setTheme(defaultTheme);
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("theme", defaultTheme);
      }
    }
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      sessionStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  const muiTheme = useMemo(() => {
    if (theme === null) return createTheme();

    const primaryColor = lightGreen[700];
    const secondaryColor = cyan[500];

    const tableRowFirstColor = grey[200];
    const tableRowSecondColor = grey[50];

    const primary =
      theme === "light"
        ? lighten(primaryColor, 0.2)
        : darken(primaryColor, 0.2);
    const secondary =
      theme === "light"
        ? lighten(secondaryColor, 0.2)
        : darken(secondaryColor, 0.2);

    const tableRowEven =
      theme === "light"
        ? lighten(tableRowSecondColor, 0.2)
        : darken(tableRowFirstColor, 0.9);

    const tableRowOdd =
      theme === "light"
        ? lighten(tableRowFirstColor, 0.2)
        : darken(tableRowSecondColor, 0.8);

    // Create a Material-UI theme based on the current mode
    const muiTheme = createTheme({
      palette: {
        mode: theme as PaletteMode,
        primary: {
          main: primary,
        },
        secondary: {
          main: secondary,
        },
        tableRow: {
          even: tableRowEven,
          odd: tableRowOdd,
        },
      },
    });

    const scrollbarBackground = theme === "dark" ? "#333" : "#f1f1f1";
    const scrollbarThumbBackground = theme === "dark" ? "#888" : "#ccc";
    const scrollbarThumbHoverBackground = theme === "dark" ? "#555" : "#999";
    const scrollbarColor = `${scrollbarThumbBackground} ${scrollbarBackground}`;

    muiTheme.components = {
      MuiCssBaseline: {
        styleOverrides: `
        ::-webkit-scrollbar {
          width: 10px;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-track {
          background: ${scrollbarBackground};
        }
        ::-webkit-scrollbar-thumb {
          background: ${scrollbarThumbBackground};
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarThumbHoverBackground};
        }
        @supports not selector(::-webkit-scrollbar) {
          html {
            scrollbar-color: ${scrollbarColor};
          }
        }
      `,
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: muiTheme.palette.background.default,
            color: theme === "light" ? "#000000" : "#ffffff",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            // Target the 'contained' variant
            color: "white",
            backgroundColor: primary,
            "&:hover": {
              color: "white",
              backgroundColor: secondary,
            },
          },
          outlined: {
            // Target the 'outlined' variant
            color: primary,
            borderColor: primary,
            "&:hover": {
              color: secondary,
              borderColor: secondary,
              backgroundColor: "transparent",
            },
          },
          text: {
            // Target the 'text' variant
            color: primary,
            "&:hover": {
              color: secondary,
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: darken(grey[200], 0.4),
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: grey[200],
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: darken(grey[200], 0.2),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: darken(grey[200], 0.4),
              color: "black",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor:
                muiTheme.palette.mode === "light"
                  ? lighten(grey[200], 0.2)
                  : darken(grey[800], 0.2),
            },
          },
          head: {
            backgroundColor: muiTheme.palette.background.default,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            borderColor: "divider",
            // Remove the border for the last cell
            "&:last-child": {
              borderRight: 0,
            },
            "&:first-of-type": {
              borderRight: 0,
            },
            textAlign: "left",
          },
          body: {
            textAlign: "left",
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            "&.Mui-checked": {
              color: primary,
            },
            "&.MuiCheckbox-indeterminate": {
              color: secondary,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: secondary,
              "&:hover": {
                backgroundColor: alpha(secondary, 0.2),
              },
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: secondary,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected, &.Mui-selected:hover": {
              backgroundColor:
                muiTheme.palette.mode === "light"
                  ? lighten(grey[200], 0.2)
                  : darken(grey[800], 0.2),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            // Only apply the primary/secondary colors to chips using the
            // default color so that semantic colors (success, warning, error)
            // used by the SearchBar are not overridden.
            "&.MuiChip-colorDefault": {
              backgroundColor: primary,
              color: getContrastRatio(primary, "#fff") > 4.5 ? "#fff" : "#111",
              "&:hover": {
                backgroundColor: secondary,
                color:
                  getContrastRatio(secondary, "#fff") > 1 ? "#fff" : "#111",
              },
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: muiTheme.palette.tableRow.odd,
              "&:hover": {
                backgroundColor: darken(muiTheme.palette.tableRow.odd, 0.1),
              },
            },
            "& .MuiTableRow-root:nth-of-type(even)": {
              backgroundColor: muiTheme.palette.tableRow.even,
              "&:hover": {
                backgroundColor: darken(muiTheme.palette.tableRow.even, 0.1),
              },
            },
          },
        },
      },
    };

    return muiTheme;
  }, [theme]);

  if (theme === null) {
    return <div>Loading Theme...</div>;
  }

  return (
    <ThemeContext value={{ theme: theme, toggleTheme }}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext>
  );
};
