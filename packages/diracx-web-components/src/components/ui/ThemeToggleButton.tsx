import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
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
        <DarkMode data-testid="dark-mode" />
      ) : (
        <LightMode data-testid="light-mode" />
      )}
    </IconButton>
  );
}
