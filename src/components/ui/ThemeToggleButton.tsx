import { IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@/hooks/theme";

/**
 * Toggle button for switching between light and dark themes.
 * @returns an IconButton
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton onClick={toggleTheme}>
      {theme === "light" ? (
        <DarkModeIcon data-testid="dark-mode" />
      ) : (
        <LightModeIcon data-testid="light-mode" />
      )}
    </IconButton>
  );
}
