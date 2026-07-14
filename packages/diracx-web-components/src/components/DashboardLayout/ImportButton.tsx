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
import React, { useState, use } from "react";
import { AppListContext, DashboardContext } from "../../contexts";
import {
  DashboardGroup,
  DashboardItem,
  ApplicationSettings,
} from "../../types";
import { ApplicationState } from "../../types/ApplicationMetadata";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (importedStates: ApplicationSettings[]) => void;
}

/**
 * ImportDialog component allows users to import application states in JSON format.
 * It provides a text area for pasting the state and a button to import it.
 * @param open - Boolean indicating if the dialog is open.
 * @param onClose - Function to close the dialog.
 * @param onImport - Function to handle the import of the state.
 */
function ImportDialog({ open, onClose, onImport }: ImportDialogProps) {
  const [stateText, setStateText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    setStateText("");
    setError(null);
  }

  const handleImport = () => {
    try {
      const parsedState: ApplicationSettings[] = JSON.parse(stateText);
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
        <Button onClick={onClose} data-testid="cancel-import-button">
          Cancel
        </Button>
        <Button
          onClick={() =>
            setStateText(localStorage.getItem("diracx-saved-states") || "")
          }
          variant="contained"
          disabled={localStorage.getItem("diracx-saved-states") === null}
        >
          Load from browser
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!stateText.trim()}
          data-testid="validate-import-button"
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * DeprecatedStateDialog component displays a dialog with a list of applications
 * that have an outdated state format. It allows users to copy the updated state.
 * @param open - Boolean indicating if the dialog is open.
 * @param onClose - Function to close the dialog.
 * @param correctStates - Array of objects containing the old and new state of the applications.
 */
function DeprecatedStateDialog({
  open,
  onClose,
  correctStates,
}: {
  open: boolean;
  onClose: () => void;
  correctStates: {
    oldSettings: ApplicationSettings;
    newState: ApplicationState;
  }[];
}) {
  const handleCopy = (app: {
    oldSettings: ApplicationSettings;
    newState: ApplicationState;
  }) => {
    const formatted = {
      appType: app.oldSettings.appType,
      appName: app.oldSettings.appName,
      state: app.newState,
    };
    navigator.clipboard.writeText(JSON.stringify(formatted));
  };

  const handleCopyAll = () => {
    const allFormatted = correctStates.map(({ oldSettings, newState }) => ({
      appType: oldSettings.appType,
      appName: oldSettings.appName,
      state: newState,
    }));
    navigator.clipboard.writeText(JSON.stringify(allFormatted));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Outdated State Format Detected</DialogTitle>
      <DialogContent>
        <p>
          Some imported applications use an outdated format that will soon no
          longer be supported.
          <br />
          Please update them now by copying their updated version.
        </p>

        <ul>
          {correctStates.map(({ oldSettings }, index) => (
            <li key={index} style={{ marginTop: "0.5em" }}>
              <b>{oldSettings.appName}</b> ({oldSettings.appType}){" "}
              <Button
                size="small"
                onClick={() => handleCopy(correctStates[index])}
                sx={{ ml: 1 }}
              >
                Copy
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCopyAll}>
          Copy All Updated JSON
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
  const [correctStates, setCorrectStates] = useState<
    { oldSettings: ApplicationSettings; newState: ApplicationState }[]
  >([]);
  const { appList } = use(AppListContext);
  const { userDashboard, setUserDashboard } = use(DashboardContext);

  const handleImport = (
    importedStates: ApplicationSettings | ApplicationSettings[],
  ) => {
    const states = Array.isArray(importedStates)
      ? importedStates
      : [importedStates];

    const count = userDashboard.filter((group) =>
      group.title.startsWith("Imported Applications"),
    ).length;

    let title = `Imported Applications${count > 0 ? ` ${count}` : ""}`;
    while (userDashboard.some((group) => group.title === title)) {
      title = `Imported Applications ${parseInt(title.split(" ")[2]) + 1}`;
    }

    // Build the new group and any outdated-state notices locally, then
    // commit them with immutable state updates.
    const newItems: DashboardItem[] = [];
    const newCorrectStates: {
      oldSettings: ApplicationSettings;
      newState: ApplicationState;
    }[] = [];

    states.forEach((state) => {
      if (state.state === "null") {
        console.warn(`No state to import for app type: ${state.appType}`);
        return;
      }
      const applicationMetadata = appList.find(
        (app) => app.name === state.appType,
      );
      const newApp = createApp(
        state.appType,
        state.appName,
        newItems,
        userDashboard,
      );
      newItems.push(newApp);
      const [appState, haveChangedState] =
        applicationMetadata?.validateAndConvertState
          ? applicationMetadata.validateAndConvertState(state.state)
          : [state.state, false];
      if (haveChangedState)
        newCorrectStates.push({ oldSettings: state, newState: appState });
      sessionStorage.setItem(`${newApp.id}_State`, appState);
    });

    // Create a group only if there are valid states to import
    if (newItems.length > 0) {
      const newGroup: DashboardGroup = {
        title: title,
        extended: true,
        items: newItems,
      };
      setUserDashboard((prev) => [...prev, newGroup]);
    }
    if (newCorrectStates.length > 0) {
      setCorrectStates((prev) => [...prev, ...newCorrectStates]);
    }
  };

  return (
    <>
      <Tooltip title="Import application state">
        <IconButton
          aria-label="Import application state"
          onClick={() => setDialogOpen(true)}
          data-testid="import-button"
        >
          <InputIcon />
        </IconButton>
      </Tooltip>

      <ImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onImport={handleImport}
      />

      <DeprecatedStateDialog
        open={correctStates.length > 0}
        onClose={() => setCorrectStates([])}
        correctStates={correctStates}
      />
    </>
  );
}

/**
 * Builds a new dashboard app entry without mutating any existing state.
 *
 * @param appType - The type of the app to be created.
 * @param appTitle - The title of the app to be created.
 * @param groupItems - The items already added to the group being built
 * (used for title deduplication and ID uniqueness).
 * @param userDashboard - The current state of the user's dashboard (read-only,
 * used for ID uniqueness).
 * @returns The newly created app entry.
 */
function createApp(
  appType: string,
  appTitle: string,
  groupItems: DashboardItem[],
  userDashboard: DashboardGroup[],
): DashboardItem {
  const count = groupItems.filter((item) =>
    item.title.startsWith(appTitle),
  ).length;

  const title = count > 0 ? `${appTitle} (${count + 1})` : appTitle;

  let appId = `${appType} 0`;
  while (
    userDashboard.some((group) =>
      group.items.some((app) => app.id === appId),
    ) ||
    groupItems.some((app) => app.id === appId)
  ) {
    const match = appId.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) + 1 : 0;
    appId = `${appType} ${num}`;
  }

  return {
    title: title,
    id: appId,
    type: appType,
  };
}
