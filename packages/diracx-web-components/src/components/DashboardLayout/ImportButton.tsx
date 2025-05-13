"use client";

import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import InputIcon from "@mui/icons-material/Input";
import React, { useState, useContext, SetStateAction } from "react";
import { ApplicationsContext } from "../../contexts";
import { ApplicationMetadata, DashboardGroup } from "../../types";
import { ApplicationState } from "../../types/ApplicationMetadata";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (state: string) => void;
}

function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [stateText, setStateText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const parsedState = JSON.parse(stateText);
      onImport(parsedState);
      onClose();
      setStateText("");
      setError(null);
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle data-testid="import-menu">
        Import Application State
      </DialogTitle>
      <DialogContent>
        <TextField
          multiline
          rows={8}
          fullWidth
          value={stateText}
          onChange={(e) => setStateText(e.target.value)}
          placeholder="Paste your application state here..."
          error={!!error}
          helperText={error}
          sx={{ mt: 2 }}
          datatype="import-menu-field"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!stateText.trim()}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * ImportButton component allows users to import the state of applications.
 * It provides a dialog to paste the state in JSON format.
 */
export function ImportButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDashboard, setUserDashboard, appList] =
    useContext(ApplicationsContext);

  const handleImport = (importedState: ApplicationState) => {
    const states = Array.isArray(importedState)
      ? importedState
      : [importedState];

    const id: number = userDashboard.reduce(
      (acc, group) =>
        group.title.startsWith("Imported Applications") ? acc + 1 : acc,
      0,
    );

    const newGroup = {
      title: `Imported Applications${id > 0 ? ` (${id})` : ""}`,
      extended: true,
      items: [],
    };

    // Create a group only if there are valid states to import
    if (states.some((state) => state.state !== "null"))
      userDashboard.push(newGroup);

    states.forEach((state) => {
      if (state.state !== "null") {
        const appId = handleAppCreation(
          state.appType,
          state.appName,
          appList,
          userDashboard,
          setUserDashboard,
        );
        sessionStorage.setItem(`${appId}_State`, state.state);
      } else {
        console.warn(`No state to import for app type: ${state.appType}`);
      }
    });
  };

  return (
    <>
      <Tooltip title="Import application state">
        <IconButton onClick={() => setDialogOpen(true)}>
          <InputIcon />
        </IconButton>
      </Tooltip>

      <ImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onImport={handleImport}
      />
    </>
  );
}

/**
 * Handles the creation of a new app in the dashboard drawer.
 *
 * @param appType - The type of the app to be created.
 * @param icon - The icon component for the app.
 */
function handleAppCreation(
  appType: string,
  appTitle: string,
  appList: ApplicationMetadata[],
  userDashboard: DashboardGroup[],
  setUserDashboard: React.Dispatch<SetStateAction<DashboardGroup[]>>,
): string {
  const group = userDashboard[userDashboard.length - 1];

  const count = userDashboard.reduce(
    (sum, group) =>
      sum +
      group.items.filter((item) => item.title.startsWith(appTitle)).length,
    0,
  );

  const title = count > 0 ? `${appTitle} (${count + 1})` : appTitle;
  const appId = `${title}${userDashboard.reduce(
    (sum, group) => sum + group.items.length,
    0,
  )}`;

  const newApp = {
    title: title,
    id: appId,
    type: appType,
    icon: appList.find((app) => app.name === appType)?.icon || null,
  };
  group.items.push(newApp);
  setUserDashboard((userDashboard) =>
    userDashboard.map((g) => (g.title === group.title ? group : g)),
  );

  return appId;
}
