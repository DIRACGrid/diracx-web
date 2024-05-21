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
} from "@mui/material";
import { MenuBook, Add } from "@mui/icons-material";
import React, {
  ComponentType,
  ReactEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import Image from "next/image";
import DrawerItemGroup from "./DrawerItemGroup";
import AppDialog from "./ApplicationDialog";
import { ApplicationsContext } from "@/contexts/ApplicationsProvider";
import { useMUITheme } from "@/hooks/theme";

interface DashboardDrawerProps {
  variant: "permanent" | "temporary";
  mobileOpen: boolean;
  width: number;
  handleDrawerToggle: ReactEventHandler;
}

/**
 * Represents a drawer component used in the dashboard.
 *
 * @component
 * @param {DashboardDrawerProps} props - The props for the DashboardDrawer component.
 * @returns {JSX.Element} The rendered DashboardDrawer component.
 */
export default function DashboardDrawer(props: DashboardDrawerProps) {
  // Determine the container for the Drawer based on whether the window object exists.
  const container =
    window !== undefined ? () => window.document.body : undefined;
  // Check if the drawer is in "temporary" mode.
  const isTemporary = props.variant === "temporary";
  // Whether the modal for Application Creation is open
  const [appDialogOpen, setAppDialogOpen] = useState(false);

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [contextState, setContextState] = useState<{
    type: string | null;
    id: string | null;
  }>({ type: null, id: null });

  const [popAnchorEl, setPopAnchorEl] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState("");

  // Define the sections that are accessible to users.
  // Each section has an associated icon and path.
  const [userSections, setSections] = useContext(ApplicationsContext);

  const theme = useMUITheme();

  useEffect(() => {
    // Handle changes to sections when drag and drop occurs.
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
          const sourceGroup = userSections.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userSections.find(
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
          const sourceGroup = userSections.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userSections.find(
            (group) => group.title == groupTitle,
          );
          const sourceIndex = sourceData.index as number;

          reorderSections(sourceGroup, targetGroup, sourceIndex);
        }
      },
    });

    /**
     * Reorders sections within a group or between different groups.
     *
     * @param sourceGroup - The source group from which the section is being moved.
     * @param destinationGroup - The destination group where the section is being moved to.
     * @param sourceIndex - The index of the section within the source group.
     * @param destinationIndex - The index where the section should be placed in the destination group.
     *                           If null, the section will be placed at the end of the destination group.
     */
    function reorderSections(
      sourceGroup: any,
      destinationGroup: any,
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

          setSections((sections) =>
            sections.map((section) =>
              section.title === sourceGroup.title
                ? { ...section, items: sourceItems }
                : section,
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

          setSections((sections) =>
            sections.map((section) =>
              section.title === sourceGroup.title
                ? { ...section, items: sourceItems }
                : section.title === destinationGroup.title
                  ? { ...section, items: destinationItems }
                  : section,
            ),
          );
        }
      }
    }
  }, [setSections, userSections]);

  /**
   * Handles the creation of a new app in the dashboard drawer.
   *
   * @param appType - The type of the app to be created.
   * @param icon - The icon component for the app.
   */
  const handleAppCreation = (appType: string, icon: ComponentType) => {
    let group = userSections[userSections.length - 1];
    const empty = !group;
    if (empty) {
      //create a new group if there is no group
      group = {
        title: `Group ${userSections.length + 1}`,
        extended: false,
        items: [],
      };
    }

    let title = `${appType} ${userSections.reduce(
      (sum, group) =>
        sum + group.items.filter((item) => item.type === appType).length,
      1,
    )}`;
    while (group.items.some((item) => item.title === title)) {
      title = `${appType} ${parseInt(title.split(" ")[1]) + 1}`;
    }

    const newApp = {
      title,
      id: `${title}${userSections.reduce(
        (sum, group) => sum + group.items.length,
        0,
      )}`,
      type: appType,
      icon: icon,
    };
    group.items.push(newApp);
    if (empty) {
      setSections([...userSections, group]);
    } else {
      setSections(
        userSections.map((g) => (g.title === group.title ? group : g)),
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
      title: `Group ${userSections.length + 1}`,
      extended: false,
      items: [],
    };
    while (userSections.some((group) => group.title === newGroup.title)) {
      newGroup.title = `Group ${parseInt(newGroup.title.split(" ")[1]) + 1}`;
    }

    setSections([...userSections, newGroup]);
    handleCloseContextMenu();
  };

  const handleDelete = () => {
    if (contextState.type === "group") {
      const newSections = userSections.filter(
        (group) => group.title !== contextState.id,
      );
      setSections(newSections);
    } else if (contextState.type === "item") {
      const newSections = userSections.map((group) => {
        const newItems = group.items.filter(
          (item) => item.id !== contextState.id,
        );
        return { ...group, items: newItems };
      });
      setSections(newSections);
    }
    handleCloseContextMenu();
  };

  const handleRenameClick = (event: any) => {
    setPopAnchorEl(event.currentTarget);
  };

  const popClose = () => {
    setRenameValue("");
    setPopAnchorEl(null);
  };

  const handleRename = () => {
    if (contextState.type === "group") {
      //check if the name is already taken
      if (userSections.some((group) => group.title === renameValue)) {
        return;
      }
      //rename the group
      const newSections = userSections.map((group) => {
        if (group.title === contextState.id) {
          return { ...group, title: renameValue };
        }
        return group;
      });
      setSections(newSections);
    } else if (contextState.type === "item") {
      const newSections = userSections.map((group) => {
        const newItems = group.items.map((item) => {
          if (item.id === contextState.id) {
            return { ...item, title: renameValue };
          }
          return item;
        });
        return { ...group, items: newItems };
      });
      setSections(newSections);
    }

    popClose();
    handleCloseContextMenu();
  };

  return (
    <>
      <Drawer
        container={isTemporary ? container : undefined}
        variant={props.variant}
        open={isTemporary ? props.mobileOpen : true}
        onClose={props.handleDrawerToggle}
        sx={{
          display: {
            xs: isTemporary ? "block" : "none",
            sm: isTemporary ? "none" : "block",
          },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: props.width,
          },
        }}
        data-testid={`drawer-${props.variant}`}
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
            <Image
              src="/DIRAC-logo.png"
              alt="DIRAC logo"
              width={150}
              height={45}
            />
          </Toolbar>
          {/* Map over user sections and render them as list items in the drawer. */}
          <List>
            {userSections.map((group) => (
              <ListItem
                key={group.title}
                disablePadding
                onContextMenu={handleContextMenu("group", group.title)}
              >
                <DrawerItemGroup
                  group={group}
                  setSections={setSections}
                  handleContextMenu={handleContextMenu}
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

          <MenuItem onClick={handleNewGroup}>New Group</MenuItem>
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
