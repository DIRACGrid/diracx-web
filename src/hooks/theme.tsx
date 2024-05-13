import { PaletteMode } from "@mui/material";
import { deepOrange, grey, lightGreen } from "@mui/material/colors";
import { createTheme, darken, lighten } from "@mui/material/styles";
import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeProvider";

/**
 * Custom hook to access the theme context
 * @returns the theme context
 * @throws an error if the hook is not used within a ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Custom hook to generate and return the Material-UI theme based on the current mode
 * @returns the Material-UI theme
 * @throws an error if the hook is not used within a ThemeProvider
 */

export const useMUITheme = () => {
  const { theme } = useTheme();

  // Create a Material-UI theme based on the current mode
  const muiTheme = createTheme({
    palette: {
      mode: theme as PaletteMode,
      primary: {
        main: "#ffffff",
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
    MuiButton: {
      styleOverrides: {
        contained: {
          // Target the 'contained' variant
          color: "white",
          backgroundColor: lightGreen[700],
          "&:hover": {
            color: "white",
            backgroundColor: deepOrange[500],
          },
        },
        outlined: {
          // Target the 'outlined' variant
          color: lightGreen[700],
          borderColor: lightGreen[700],
          "&:hover": {
            color: deepOrange[500],
            borderColor: deepOrange[500],
            backgroundColor: "transparent",
          },
        },
        text: {
          // Target the 'text' variant
          color: lightGreen[700],
          "&:hover": {
            color: deepOrange[500],
            backgroundColor: "transparent",
            //underline in deep orange
            textDecoration: "underline",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: lightGreen[100],
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
            color: lightGreen[700],
          },
          "&.MuiCheckbox-indeterminate": {
            color: deepOrange[500],
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
  };

  return muiTheme;
};
