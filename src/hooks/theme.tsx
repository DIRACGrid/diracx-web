import { ThemeContext } from "@/contexts/ThemeProvider";
import { PaletteMode } from "@mui/material";
import deepOrange from "@mui/material/colors/deepOrange";
import lightGreen from "@mui/material/colors/lightGreen";
import { createTheme } from "@mui/material/styles";
import { useContext } from "react";

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
    components: {
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
        },
      },
    },
  });

  return muiTheme;
};
