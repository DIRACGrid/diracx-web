"use client";
import { useContext, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { ApplicationsContext } from "../../contexts";

/**
 * ApplicationSelector component renders the currently selected application
 * based on the user's dashboard and application list.
 * If no application is selected, it defaults to the first available application.
 */
export function ApplicationSelector() {
  const [userDashboard, , applicationList, currentAppId, setCurrentAppId] =
    useContext(ApplicationsContext);

  const group = userDashboard.find((group) =>
    group.items.some((item) => item.id === currentAppId),
  );
  const appType =
    group?.items.find((item) => item.id === currentAppId)?.type || "none";

  useEffect(() => {
    if (appType === "none") {
      // If no app type is found, set the first application as default
      const firstApp = userDashboard.find((group) => group.items.length > 0)
        ?.items[0];
      if (firstApp) {
        setCurrentAppId(firstApp.id);
      }
    }
  }, [appType, userDashboard, setCurrentAppId]);

  return userDashboard.map((group) =>
    group.items.map((item) => {
      const Component = applicationList.find(
        (app) => app.name === item.type,
      )?.component;
      return (
        <Box
          key={item.id}
          sx={{
            display: currentAppId === item.id ? "flex" : "none",
            width: "100%",
            height: "100%",
          }}
        >
          {Component ? (
            <Component />
          ) : (
            <Typography>You can click Add Application to add an app</Typography>
          )}
        </Box>
      );
    }),
  );
}
