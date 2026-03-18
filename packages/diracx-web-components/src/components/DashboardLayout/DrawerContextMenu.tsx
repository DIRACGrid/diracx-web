"use client";

import { Menu, MenuItem } from "@mui/material";

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
}

interface DrawerContextMenuProps {
  contextMenu: ContextMenuState | null;
  contextType: string | null;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onNewGroup: () => void;
}

export default function DrawerContextMenu({
  contextMenu,
  contextType,
  onClose,
  onRename,
  onDelete,
  onNewGroup,
}: DrawerContextMenuProps) {
  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      data-testid="context-menu"
    >
      {contextType && <MenuItem onClick={onRename}>Rename</MenuItem>}
      {contextType && <MenuItem onClick={onDelete}>Delete</MenuItem>}
      {contextType === null && (
        <MenuItem onClick={onNewGroup}>New Group</MenuItem>
      )}
    </Menu>
  );
}
