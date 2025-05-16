"use client";

import { useState, useContext } from "react";

import {
  IconButton,
  Tooltip,
  Menu,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  useTheme,
  FormControlLabel,
} from "@mui/material";

import OutputIcon from "@mui/icons-material/Output";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { DashboardGroup } from "../../types/DashboardGroup";

import { ApplicationsContext } from "../../contexts";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  state: string;
}

function ExportDialog({ open, onClose, state }: ExportDialogProps) {
  const theme = useTheme();
  const handleCopy = () => {
    navigator.clipboard.writeText(state);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Application State</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            bgcolor: theme.palette.mode === "light" ? "grey.100" : "grey.800",
            p: 2,
            borderRadius: 1,
          }}
        >
          {state}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} data-testid="cancel-export-button">
          Cancel
        </Button>
        <Button
          onClick={handleCopy}
          startIcon={<ContentCopyIcon />}
          variant="contained"
          data-testid="validate-export-button"
        >
          Copy to Clipboard
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * ExportButton component allows users to share the state of selected applications.
 * It provides a menu with checkboxes for each application and a dialog to display the state.
 */
export function ExportButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [groups, ,] = useContext(ApplicationsContext);

  // Function to handle the click event on the share button
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSelectedApps([]); // Reset selection when opening menu
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAppToggle = (appId: string) => {
    setSelectedApps((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId);
      } else {
        return [...prev, appId];
      }
    });
  };

  // Function to handle the share action
  // It collects the state of selected applications and opens the dialog
  const handleExport = () => {
    const states = selectedApps.map((appId) => {
      const app = groups.flatMap((g) => g.items).find((a) => a.id === appId);
      if (!app) return null;

      const appState = sessionStorage.getItem(`${appId}_State`);
      return {
        appType: app.type,
        appName: app.title,
        state: typeof appState === "string" ? appState : "null",
      };
    });

    setSelectedState(JSON.stringify(states));
    setDialogOpen(true);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Export application state">
        <IconButton onClick={handleClick} data-testid="export-button">
          <OutputIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        data-testid="export-menu"
        slotProps={{ paper: { sx: { p: 2 } } }}
      >
        {groups.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.title}>
                <FormControlLabel
                  label={group.title}
                  control={
                    <Checkbox
                      checked={group.items.every((app) =>
                        selectedApps.includes(app.id),
                      )}
                      indeterminate={
                        group.items.some((app) =>
                          selectedApps.includes(app.id),
                        ) &&
                        !group.items.every((app) =>
                          selectedApps.includes(app.id),
                        )
                      }
                      onChange={() => {
                        const allSelected = group.items.every((app) =>
                          selectedApps.includes(app.id),
                        );
                        if (allSelected) {
                          setSelectedApps((prev) =>
                            prev.filter(
                              (id) => !group.items.some((app) => app.id === id),
                            ),
                          );
                        } else {
                          setSelectedApps((prev) => [
                            ...prev,
                            ...group.items.map((app) => app.id),
                          ]);
                        }
                      }}
                    />
                  }
                />
                <GroupCheckboxSection
                  group={group}
                  selectedApps={selectedApps}
                  handleAppToggle={handleAppToggle}
                />
              </div>
            ),
        )}
        {selectedApps.length > 0 && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleExport}
              startIcon={<OutputIcon />}
            >
              Export {selectedApps.length} selected
            </Button>
          </Box>
        )}
      </Menu>

      <ExportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        state={selectedState}
      />
    </>
  );
}

/**
 *
 * @param group - The group of applications
 * @param selectedApps - The list of selected application IDs
 * @param handleAppToggle - The function to handle toggling the checkbox
 * @returns A subsection of checkboxes for the applications in the group
 */
function GroupCheckboxSection({
  group,
  selectedApps,
  handleAppToggle,
}: {
  group: DashboardGroup;
  selectedApps: string[];
  handleAppToggle: (appId: string) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", ml: 2 }}>
      {group.items.map((app) => (
        <FormControlLabel
          key={app.id}
          label={app.title}
          control={
            <Checkbox
              checked={selectedApps.includes(app.id)}
              onChange={() => handleAppToggle(app.id)}
              size="small"
              data-testid={`checkbox-${app.id}`}
            />
          }
        />
      ))}
    </Box>
  );
}
