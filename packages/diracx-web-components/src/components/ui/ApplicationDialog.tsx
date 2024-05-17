import React, { ComponentType } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  Icon,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { applicationList } from "../applications/ApplicationList";

/**
 * Renders a dialog component for creating a new application.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.appDialogOpen - Determines whether the dialog is open or not.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setAppDialogOpen - Function to set the open state of the dialog.
 * @param {(name: string, path: string, icon: ComponentType) => void} props.handleCreateApp - Function to handle the creation of a new application.
 * @returns {JSX.Element} The rendered dialog component.
 */
export default function AppDialog({
  appDialogOpen,
  setAppDialogOpen,
  handleCreateApp,
}: {
  appDialogOpen: boolean;
  setAppDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateApp: (name: string, icon: ComponentType) => void;
}) {
  const [appType, setAppType] = React.useState("");
  return (
    <Dialog
      open={appDialogOpen}
      onClose={() => setAppDialogOpen(false)}
      aria-labelledby="application-dialog-label"
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();

          const icon = applicationList.find(
            (app) => app.name === appType
          )?.icon;
          if (!icon) {
            console.error("Icon not found for application type", appType);
            return;
          }

          handleCreateApp(appType, icon as React.ComponentType<any>);

          setAppDialogOpen(false);
        },
      }}
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
            <Grid item key={app.name} xs="auto">
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setAppType(app.name);
                }}
                type="submit"
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
