"use client";

import {
  CssBaseline,
  ThemeProvider as MUIThemeProvider,
  createTheme,
  getContrastRatio,
  lighten,
  darken,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { cyan, grey, lightGreen } from "@mui/material/colors";
import { createContext, useCallback, useMemo, useState } from "react";

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

/** The two supported theme modes */
export type ThemeMode = "light" | "dark";

/** Type guard narrowing an arbitrary stored string to a valid theme mode */
function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

/**
 * Theme context type
 * @property theme - the current theme mode
 * @property toggleTheme - function to toggle the theme mode
 */
type ThemeContextType = {
  theme: ThemeMode;
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
  const [theme, setTheme] = useState<ThemeMode | null>(null);
  const [prevPrefersDark, setPrevPrefersDark] = useState(prefersDarkMode);

  // Initialize theme from sessionStorage or system preference.
  // Render is kept pure: storage is only written from the toggle handler,
  // where it records an explicit user choice.
  if (theme === null) {
    const storedTheme =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("theme")
        : null;
    setTheme(
      isThemeMode(storedTheme)
        ? storedTheme
        : prefersDarkMode
          ? "dark"
          : "light",
    );
  }

  // Follow system preference changes unless the user made an explicit choice
  if (prevPrefersDark !== prefersDarkMode) {
    setPrevPrefersDark(prefersDarkMode);
    const storedTheme =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("theme")
        : null;
    if (!isThemeMode(storedTheme)) {
      setTheme(prefersDarkMode ? "dark" : "light");
    }
  }

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme: ThemeMode = prevTheme === "light" ? "dark" : "light";
      sessionStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }, []);

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

    // Outlined-input border/label colors for the current palette mode.
    // Light mode keeps the historical grey[200] derivatives; dark mode
    // mirrors them from grey[800] so borders stay subtle on dark surfaces.
    const inputBorder = theme === "light" ? grey[200] : grey[800];
    const inputBorderHover =
      theme === "light" ? darken(grey[200], 0.2) : lighten(grey[800], 0.2);
    const inputBorderFocused =
      theme === "light" ? darken(grey[200], 0.4) : lighten(grey[800], 0.4);
    const inputTextFocused = theme === "light" ? "black" : "white";

    // Create a Material-UI theme based on the current mode
    const muiTheme = createTheme({
      palette: {
        mode: theme,
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
      typography: {
        fontSize: 14,
      },
    });

    const scrollbarBackground = theme === "dark" ? "#333" : "#f1f1f1";
    const scrollbarThumbBackground = theme === "dark" ? "#888" : "#ccc";
    const scrollbarThumbHoverBackground = theme === "dark" ? "#555" : "#999";
    const scrollbarColor = `${scrollbarThumbBackground} ${scrollbarBackground}`;

    muiTheme.components = {
      // Global dense defaults — enforces compact sizing across all components
      MuiTextField: {
        defaultProps: { size: "small" },
      },
      MuiFormControl: {
        defaultProps: { size: "small" },
      },
      MuiInputBase: {
        defaultProps: { size: "small" },
      },
      MuiSelect: {
        defaultProps: { size: "small" },
      },
      MuiIconButton: {
        defaultProps: { size: "small" },
      },
      MuiToolbar: {
        defaultProps: { variant: "dense" },
      },
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
        defaultProps: { size: "small" },
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
              color: inputBorderFocused,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: inputBorder,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: inputBorderHover,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: inputBorderFocused,
              color: inputTextFocused,
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
          root: {
            padding: "4px 8px",
          },
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
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            // Only apply the primary/secondary colors to chips using the
            // default color so that semantic colors (success, warning, error)
            // used by the SearchBar are not overridden.
            "&.MuiChip-colorDefault.MuiChip-filled": {
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
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            // Use data-attribute selectors instead of nth-of-type so that
            // virtualized tables (where DOM order ≠ data order) get stable
            // alternating row colors.
            "& .MuiTableRow-root[data-row-parity='odd'] td": {
              backgroundColor: muiTheme.palette.tableRow.odd,
            },
            "& .MuiTableRow-root[data-row-parity='odd']:hover td": {
              backgroundColor: darken(muiTheme.palette.tableRow.odd, 0.1),
            },
            "& .MuiTableRow-root[data-row-parity='even'] td": {
              backgroundColor: muiTheme.palette.tableRow.even,
            },
            "& .MuiTableRow-root[data-row-parity='even']:hover td": {
              backgroundColor: darken(muiTheme.palette.tableRow.even, 0.1),
            },
          },
        },
      },
    };

    return muiTheme;
  }, [theme]);

  const themeContextValue = useMemo<ThemeContextType | null>(
    () => (theme === null ? null : { theme, toggleTheme }),
    [theme, toggleTheme],
  );

  if (themeContextValue === null) {
    return <div>Loading Theme...</div>;
  }

  return (
    <ThemeContext value={themeContextValue}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext>
  );
};
