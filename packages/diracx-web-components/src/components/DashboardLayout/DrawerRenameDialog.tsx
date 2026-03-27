"use client";

import { Box, Button, Popover, TextField } from "@mui/material";

interface DrawerRenameDialogProps {
  anchorEl: HTMLElement | null;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function DrawerRenameDialog({
  anchorEl,
  renameValue,
  onRenameValueChange,
  onSubmit,
  onClose,
}: DrawerRenameDialogProps) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <Box sx={{ p: 2, display: "flex" }}>
          <TextField
            autoFocus
            label="New Name"
            value={renameValue}
            onChange={(e) => onRenameValueChange(e.target.value)}
          />
          <Button variant="outlined" type="submit">
            Rename
          </Button>
        </Box>
      </form>
    </Popover>
  );
}
