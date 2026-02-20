"use client";

import { use } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  Grid,
  Icon,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ApplicationsContext } from "../../contexts/ApplicationsProvider";

interface AppDialogProps {
  /** Determines whether the dialog is open or not. */
  appDialogOpen: boolean;
  /** Function to set the open state of the dialog. */
  setAppDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Function to handle the creation of a new application. */
  handleCreateApp: (name: string) => void;
}

/**
 * Renders a dialog component for creating a new application.
 *
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The rendered dialog component.
 */
export default function AppDialog({
  appDialogOpen,
  setAppDialogOpen,
  handleCreateApp,
}: AppDialogProps) {
  const applicationList = use(ApplicationsContext)[2];
  return (
    <Dialog
      open={appDialogOpen}
      onClose={() => setAppDialogOpen(false)}
      aria-labelledby="application-dialog-label"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="application-dialog-label">
        Available applications
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => setAppDialogOpen(false)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Click on any application to open it in a new instance in the drawer.
          Multiple instances of the same application can be opened
          simultaneously.
        </DialogContentText>
        <Grid container spacing={2}>
          {applicationList.map((app) => (
            <Grid key={app.name} sx={{ xs: "auto", pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  handleCreateApp(app.name);
                  setAppDialogOpen(false);
                }}
                data-testid="create-application-button"
              >
                <Icon component={app.icon} sx={{ mr: 1 }} />
                {app.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
