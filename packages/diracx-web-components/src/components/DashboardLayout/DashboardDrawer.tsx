"use client";

import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Toolbar,
  useTheme,
} from "@mui/material";
import { MenuBook, Add, SvgIconComponent } from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { ApplicationsContext } from "../../contexts/ApplicationsProvider";
import { DashboardGroup } from "../../types";
import DrawerItemGroup from "./DrawerItemGroup";
import AppDialog from "./ApplicationDialog";

interface DashboardDrawerProps {
  /** The variant of the drawer. Usually temporary if on mobile and permanent otherwise. */
  variant: "permanent" | "temporary";
  /** Whether the drawer is open on mobile. */
  mobileOpen: boolean;
  /** The width of the drawer. */
  width: number;
  /** The function to handle the drawer toggle. */
  handleDrawerToggle: React.ReactEventHandler;
  /** The URL for the logo image. */
  logoURL?: string;
}

/**
 * Represents a drawer component used in the dashboard.
 *
 * @component
 * @param {DashboardDrawerProps} props - The props for the DashboardDrawer component.
 * @returns {JSX.Element} The rendered DashboardDrawer component.
 */
export default function DashboardDrawer({
  variant,
  mobileOpen,
  width,
  handleDrawerToggle,
  logoURL = "/DIRAC-logo.png",
}: DashboardDrawerProps) {
  // Determine the container for the Drawer based on whether the window object exists.
  const container =
    window !== undefined ? () => window.document.body : undefined;
  // Check if the drawer is in "temporary" mode.
  const isTemporary = variant === "temporary";
  // Whether the modal for Application Creation is open
  const [appDialogOpen, setAppDialogOpen] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [contextState, setContextState] = useState<{
    type: string | null;
    id: string | null;
  }>({ type: null, id: null });

  const [popAnchorEl, setPopAnchorEl] = useState<HTMLElement | null>(null);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renamingGroupId, setRenamingGroupId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Define the applications that are accessible to users.
  // Each application has an associated icon and path.
  const [userDashboard, setUserDashboard] = useContext(ApplicationsContext);

  const theme = useTheme();

  useEffect(() => {
    // Handle changes to app instances when drag and drop occurs.
    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }
        const sourceData = source.data;
        const targetData = target.data;

        if (location.current.dropTargets.length == 2) {
          // If the target is an item
          const groupTitle = targetData.title;
          const closestEdgeOfTarget = extractClosestEdge(targetData);
          const targetIndex = targetData.index as number;
          const sourceGroup = userDashboard.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userDashboard.find(
            (group) => group.title == groupTitle,
          );
          const sourceIndex = sourceData.index as number;
          const destinationIndex = (
            closestEdgeOfTarget === "top" ? targetIndex : targetIndex + 1
          ) as number;

          reorderSections(
            sourceGroup,
            targetGroup,
            sourceIndex,
            destinationIndex,
          );
        } else {
          // If the target is a group
          const groupTitle = targetData.title;
          const sourceGroup = userDashboard.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userDashboard.find(
            (group) => group.title == groupTitle,
          );
          const sourceIndex = sourceData.index as number;

          reorderSections(sourceGroup, targetGroup, sourceIndex);
        }
      },
    });

    /**
     * Reorders app instances within a group or between different groups.
     *
     * @param sourceGroup - The source group from which the app instance is being moved.
     * @param destinationGroup - The destination group where the app instance is being moved to.
     * @param sourceIndex - The index of the app instance within the source group.
     * @param destinationIndex - The index where the app instance should be placed in the destination group.
     *                           If null, the app instance will be placed at the end of the destination group.
     */
    function reorderSections(
      sourceGroup: DashboardGroup | undefined,
      destinationGroup: DashboardGroup | undefined,
      sourceIndex: number,
      destinationIndex: number | null = null,
    ) {
      if (sourceGroup && destinationGroup) {
        if (
          sourceGroup.title === destinationGroup.title &&
          destinationIndex &&
          sourceIndex < destinationIndex
        ) {
          destinationIndex -= 1; // Corrects the index within the same group if needed
        }
        if (
          sourceGroup.title === destinationGroup.title &&
          (destinationIndex == null || sourceIndex === destinationIndex)
        ) {
          return; // Nothing to do
        }

        if (sourceGroup.title === destinationGroup.title) {
          const sourceItems = [...sourceGroup.items];

          const [removed] = sourceItems.splice(sourceIndex, 1);

          if (destinationIndex === null) {
            destinationIndex = sourceItems.length;
          }
          sourceItems.splice(destinationIndex, 0, removed);

          setUserDashboard((groups) =>
            groups.map((group) =>
              group.title === sourceGroup.title
                ? { ...group, items: sourceItems }
                : group,
            ),
          );
        } else {
          const sourceItems = [...sourceGroup.items];

          const [removed] = sourceItems.splice(sourceIndex, 1);

          const destinationItems = [...destinationGroup.items];

          if (destinationIndex === null) {
            destinationIndex = destinationItems.length;
          }
          destinationItems.splice(destinationIndex, 0, removed);

          setUserDashboard((groups) =>
            groups.map((group) =>
              group.title === sourceGroup.title
                ? { ...group, items: sourceItems }
                : group.title === destinationGroup.title
                  ? { ...group, items: destinationItems }
                  : group,
            ),
          );
        }
      }
    }
  }, [setUserDashboard, userDashboard]);

  /**
   * Handles the creation of a new app in the dashboard drawer.
   *
   * @param appType - The type of the app to be created.
   * @param icon - The icon component for the app.
   */
  const handleAppCreation = (appType: string, icon: SvgIconComponent) => {
    let group = userDashboard[userDashboard.length - 1];
    const empty = !group;
    if (empty) {
      //create a new group if there is no group
      group = {
        title: `Group ${userDashboard.length + 1}`,
        extended: false,
        items: [],
      };
    }

    let title = `${appType} ${userDashboard.reduce(
      (sum, group) =>
        sum + group.items.filter((item) => item.type === appType).length,
      1,
    )}`;
    while (group.items.some((item) => item.title === title)) {
      title = `${appType} ${parseInt(title.split(" ")[1]) + 1}`;
    }

    const newApp = {
      title,
      id: `${title}${userDashboard.reduce(
        (sum, group) => sum + group.items.length,
        0,
      )}`,
      type: appType,
      icon: icon,
    };
    group.items.push(newApp);
    if (empty) {
      setUserDashboard((userDashboard) => [...userDashboard, group]);
    } else {
      setUserDashboard((userDashboard) =>
        userDashboard.map((g) => (g.title === group.title ? group : g)),
      );
    }
  };

  let isContextStateStable = true;

  const handleContextMenu =
    (type: "group" | "item" | null = null, id: string | null = null) =>
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (contextMenu !== null) {
        handleCloseContextMenu();
        return;
      }
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
      });
      if (isContextStateStable) {
        setContextState({ type, id });
        isContextStateStable = false;
      }
    };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextState({ type: null, id: null });
    isContextStateStable = true;
  };

  const handleNewGroup = () => {
    const newGroup = {
      title: `Group ${userDashboard.length + 1}`,
      extended: false,
      items: [],
    };
    while (userDashboard.some((group) => group.title === newGroup.title)) {
      newGroup.title = `Group ${parseInt(newGroup.title.split(" ")[1]) + 1}`;
    }

    setUserDashboard((userDashboard) => [...userDashboard, newGroup]);
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (contextState.type === "group") {
      const group = userDashboard.find(
        (group) => group.title === contextState.id,
      );
      if (group) {
        group.items.forEach((item) => {
          sessionStorage.removeItem(`${item.id}_State`);
        });
      }

      setUserDashboard((userDashboard) =>
        userDashboard.filter((group) => group.title !== contextState.id),
      );
    } else if (contextState.type === "item") {
      sessionStorage.removeItem(`${contextState.id}_State`);

      setUserDashboard((userDashboard) =>
        userDashboard.map((group) => {
          const newItems = group.items.filter(
            (item) => item.id !== contextState.id,
          );
          return { ...group, items: newItems };
        }),
      );
    }
    handleCloseContextMenu();
  };

  const handleRenameClick = () => {
    if (contextState.type === "group") {
      setRenamingGroupId(contextState.id);
    } else if (contextState.type === "item") {
      setRenamingItemId(contextState.id);
    }
    setRenameValue("");
    handleCloseContextMenu();
  };

  const popClose = () => {
    setRenameValue("");
    setPopAnchorEl(null);
  };

  const handleRename = () => {
    if (contextState.type === "group") {
      //check if the name is already taken
      if (userDashboard.some((group) => group.title === renameValue)) {
        return;
      }
      //rename the group
      setUserDashboard((userDashboard) =>
        userDashboard.map((group) => {
          if (group.title === contextState.id) {
            return { ...group, title: renameValue };
          }
          return group;
        }),
      );
    } else if (contextState.type === "item") {
      setUserDashboard((userDashboard) =>
        userDashboard.map((group) => {
          const newItems = group.items.map((item) => {
            if (item.id === contextState.id) {
              return { ...item, title: renameValue };
            }
            return item;
          });
          return { ...group, items: newItems };
        }),
      );
    }

    popClose();
    handleCloseContextMenu();
  };

  return (
    <>
      <Drawer
        container={isTemporary ? container : undefined}
        variant={variant}
        open={isTemporary ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          display: {
            xs: isTemporary ? "block" : "none",
            sm: isTemporary ? "none" : "block",
          },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: width,
          },
        }}
        data-testid={`drawer-${variant}`}
        onContextMenu={handleContextMenu()}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Display the logo in the toolbar section of the drawer. */}
          <Toolbar
            sx={{
              position: "sticky",
              top: "0",
              zIndex: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <img src={logoURL} alt="DIRAC logo" style={{ maxWidth: "100%" }} />
          </Toolbar>
          {/* Map over user app instances and render them as list items in the drawer. */}
          <List>
            {userDashboard.map((group) => (
              <ListItem
                key={group.title}
                disablePadding
                onContextMenu={handleContextMenu("group", group.title)}
              >
                <DrawerItemGroup
                  group={group}
                  setUserDashboard={setUserDashboard}
                  handleContextMenu={handleContextMenu}
                  renamingGroupId={renamingGroupId}
                  setRenamingGroupId={setRenamingGroupId}
                  renamingItemId={renamingItemId}
                  setRenamingItemId={setRenamingItemId}
                  renameValue={renameValue}
                  setRenameValue={setRenameValue}
                />
              </ListItem>
            ))}
          </List>

          {/* Render a link to documentation and a button to add applications, positioned at the bottom of the drawer. */}
          <List
            sx={{
              mt: "auto",
              position: "sticky",
              bottom: "0",
              zIndex: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <ListItem key={"Add application"}>
              <ListItemButton onClick={() => setAppDialogOpen(true)}>
                <ListItemIcon>{<Add />}</ListItemIcon>
                <ListItemText primary={"Add application"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={"Documentation"}>
              <ListItemButton
                target="_blank"
                href="https://dirac.readthedocs.io/en/latest/"
              >
                <ListItemIcon>{<MenuBook />}</ListItemIcon>
                <ListItemText primary={"Documentation"} />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
          data-testid="context-menu"
        >
          {contextState.type && (
            <MenuItem onClick={handleRenameClick}>Rename</MenuItem>
          )}
          {contextState.type && (
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          )}
          {contextState.type === null && (
            <MenuItem onClick={handleNewGroup}>New Group</MenuItem>
          )}
        </Menu>
        <Popover
          open={Boolean(popAnchorEl)}
          anchorEl={popAnchorEl}
          onClose={popClose}
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
              handleRename();
            }}
          >
            <Box sx={{ p: 2, display: "flex" }}>
              <TextField
                autoFocus
                label="New Name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
              <Button variant="outlined" type="submit">
                Rename
              </Button>
            </Box>
          </form>
        </Popover>
      </Drawer>
      <AppDialog
        appDialogOpen={appDialogOpen}
        setAppDialogOpen={setAppDialogOpen}
        handleCreateApp={handleAppCreation}
      />
    </>
  );
}
