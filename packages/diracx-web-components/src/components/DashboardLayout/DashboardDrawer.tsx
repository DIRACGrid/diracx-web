"use client";

import {
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
} from "@mui/material";
import MenuBook from "@mui/icons-material/MenuBook";
import Add from "@mui/icons-material/Add";
import React, { use, useRef, useState } from "react";
import Image from "next/image";
import { DashboardContext } from "../../contexts/ApplicationsProvider";
import DrawerItemGroup from "./DrawerItemGroup";
import AppDialog from "./ApplicationDialog";
import DrawerContextMenu from "./DrawerContextMenu";
import DrawerRenameDialog from "./DrawerRenameDialog";
import useDashboardDragDrop from "./useDashboardDragDrop";

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
  /** The URL for the documentation link. */
  documentationURL?: string;
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
  documentationURL,
}: DashboardDrawerProps) {
  const isTemporary = variant === "temporary";
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [drawerBusy, setDrawerBusy] = useState(false);

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

  const { userDashboard, setUserDashboard, setCurrentAppId } =
    use(DashboardContext);

  const theme = useTheme();

  // Set up drag and drop
  useDashboardDragDrop(userDashboard, setUserDashboard);

  const handleAppCreation = (appType: string) => {
    const group =
      userDashboard.length > 0
        ? userDashboard[userDashboard.length - 1]
        : {
            title: `Group 1`,
            extended: false,
            items: [],
          };

    const empty = userDashboard.length === 0;

    const count = group.items.filter((item) =>
      item.title.startsWith(appType),
    ).length;

    let title = `${appType} ${count > 0 ? `${count}` : ""}`;
    while (group.items.some((app) => app.title === title)) {
      const match = title.match(/(\d+)$/);
      const num = match ? parseInt(match[1], 10) + 1 : undefined;
      title = `${appType} ${num}`;
    }

    let appId = `${appType} 0`;
    while (
      userDashboard.some((group) => group.items.some((app) => app.id === appId))
    ) {
      const match = appId.match(/(\d+)$/);
      const num = match ? parseInt(match[1], 10) + 1 : 0;
      appId = `${appType} ${num}`;
    }
    const newApp = {
      title,
      id: appId,
      type: appType,
    };
    group.items.push(newApp);
    if (empty) {
      setUserDashboard((userDashboard) => [...userDashboard, group]);
    } else {
      setUserDashboard((userDashboard) =>
        userDashboard.map((g) => (g.title === group.title ? group : g)),
      );
    }
    setCurrentAppId(newApp.id);
  };

  const isContextStateStable = useRef(true);

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
      if (isContextStateStable.current) {
        setContextState({ type, id });
        isContextStateStable.current = false;
      }
    };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setContextState({ type: null, id: null });
    isContextStateStable.current = true;
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
      setRenameValue(contextState.id ?? "");
    } else if (contextState.type === "item") {
      setRenamingItemId(contextState.id);
      const currentTitle = userDashboard
        .flatMap((group) => group.items)
        .find((item) => item.id === contextState.id)?.title;
      setRenameValue(currentTitle ?? "");
    }
    handleCloseContextMenu();
  };

  const popClose = () => {
    setRenameValue("");
    setPopAnchorEl(null);
  };

  const handleRename = async () => {
    setDrawerBusy(true);
    if (contextState.type === "group") {
      if (userDashboard.some((group) => group.title === renameValue)) {
        return;
      }
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
    setDrawerBusy(false);
  };

  const docURL = documentationURL || "https://diracx.io";

  return (
    <>
      <Drawer
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
          <Toolbar
            sx={{
              position: "sticky",
              top: "0",
              zIndex: 1,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Image
              src={logoURL}
              alt="DIRAC logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </Toolbar>
          <List>
            {userDashboard.map((group, index) => (
              <ListItem
                key={index}
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
              <ListItemButton
                onClick={() => setAppDialogOpen(true)}
                data-testid="add-application-button"
              >
                <ListItemIcon>{<Add />}</ListItemIcon>
                <ListItemText primary={"Add application"} />
                {drawerBusy && <CircularProgress size={16} sx={{ ml: 1 }} />}
              </ListItemButton>
            </ListItem>
            <ListItem key={"Documentation"}>
              <ListItemButton target="_blank" href={docURL}>
                <ListItemIcon>{<MenuBook />}</ListItemIcon>
                <ListItemText primary={"Documentation"} />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
        <DrawerContextMenu
          contextMenu={contextMenu}
          contextType={contextState.type}
          onClose={handleCloseContextMenu}
          onRename={handleRenameClick}
          onDelete={handleDelete}
          onNewGroup={handleNewGroup}
        />
        <DrawerRenameDialog
          anchorEl={popAnchorEl}
          renameValue={renameValue}
          onRenameValueChange={setRenameValue}
          onSubmit={handleRename}
          onClose={popClose}
        />
      </Drawer>
      <AppDialog
        appDialogOpen={appDialogOpen}
        setAppDialogOpen={setAppDialogOpen}
        handleCreateApp={handleAppCreation}
      />
    </>
  );
}
