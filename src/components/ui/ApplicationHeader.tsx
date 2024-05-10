import React from "react";
import { Stack, Typography } from "@mui/material";
import { useApplicationTitle } from "@/hooks/application";

/**
 * Application Header component with the application title and type
 * @param type the type of the application
 * @returns the application header
 */
export default function ApplicationHeader({ type }: { type: string }) {
  const appTitle = useApplicationTitle();
  return (
    <header>
      <Stack spacing={2} direction={"row"} alignItems={"end"}>
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
