import React from "react";
import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useApplicationTitle } from "@/hooks/application";

/**
 * Application Header component with the application title and type
 * @param type the type of the application
 * @returns the application header
 */
export default function ApplicationHeader({ type }: { type: string }) {
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
            variant={"h4"}
            fontWeight={"bold"}
            width={"fit-content"}
          >
            {appTitle}
          </Typography>
        )}
        <Typography color="text.secondary" variant={"h4"} width={"fit-content"}>
          {type}
        </Typography>
      </Stack>
    </header>
  );
}
