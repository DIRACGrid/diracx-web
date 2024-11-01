import React from "react";
import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useApplicationTitle } from "@/hooks/application";

export interface ApplicationHeaderProps {
  /** The type of the application. */
  type: string;
  /** The size of the header, default is h4 */
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

/**
 * Application Header component with the application title and type
 *
 * @returns The Application Header component
 */
export default function ApplicationHeader({
  type,
  size = "h5",
}: ApplicationHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const appTitle = useApplicationTitle();

  return (
    <header>
      <Stack
        spacing={2}
        direction={isMobile ? "column" : "row"}
        alignItems={isMobile ? "start" : "end"}
      >
        {appTitle && (
          <Typography
            color="text.primary"
            variant={size}
            fontWeight={"bold"}
            width={"fit-content"}
          >
            {appTitle}
          </Typography>
        )}
        <Typography color="text.secondary" variant={size} width={"fit-content"}>
          {type}
        </Typography>
      </Stack>
    </header>
  );
}
