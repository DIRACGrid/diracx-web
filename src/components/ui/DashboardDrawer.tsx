import { usePathname } from "next/navigation";
import {
  Drawer,
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Dashboard, FolderCopy } from "@mui/icons-material";
import MonitorIcon from "@mui/icons-material/Monitor";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import React, { ComponentType, ReactEventHandler, useState } from "react";
import DrawerItemGroup from "./DrawerItemGroup";
import { DiracLogo } from "./DiracLogo";

interface DashboardDrawerProps {
  variant: "permanent" | "temporary";
  mobileOpen: boolean;
  width: number;
  handleDrawerToggle: ReactEventHandler;
}

export default function DashboardDrawer(props: DashboardDrawerProps) {
  // Get the current URL
  const pathname = usePathname();
  // Determine the container for the Drawer based on whether the window object exists.
  const container =
    window !== undefined ? () => window.document.body : undefined;
  // Check if the drawer is in "temporary" mode.
  const isTemporary = props.variant === "temporary";

  // Define the sections that are accessible to users.
  // Each section has an associated icon and path.
  const [userSections, setSections] = useState([
    {
      title: "Dashboard",
      extended: true,
      items: [
        { title: "Dashboard", id: 0, icon: Dashboard, path: "/" },
        { title: "Job Monitor", id: 1, icon: MonitorIcon, path: "/jobmonitor" },
      ],
    },
    {
      title: "Other",
      extended: false,
      items: [
        {
          title: "File Catalog",
          id: 2,
          icon: FolderCopy,
          path: "/filecatalog",
        },
      ],
    },
    {
      title: "Other2",
      extended: false,
      items: [],
    },
  ] as {
    title: string;
    extended: boolean;
    items: { title: string; id: number; icon: ComponentType; path: string }[];
  }[]);

  /**
   * Handles the drag end event for reordering items in the group.
   *
   * @param result - The result object containing information about the drag event.
   */
  function onDragEnd(result: any) {
    // Reorder the list of items in the group.
    if (!result.destination) {
      return;
    }
    const source = result.source;
    const destination = result.destination;

    const sourceGroup = userSections.find(
      (group) => group.title == source.droppableId,
    );
    const destinationGroup = userSections.find(
      (group) => group.title == destination.droppableId,
    );

    if (sourceGroup && destinationGroup) {
      const sourceItems = [...sourceGroup.items];
      const destinationItems = [...destinationGroup.items];

      const [removed] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, removed);

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

  return (
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
    >
      <div>
        {/* Display the logo in the toolbar section of the drawer. */}
        <Toolbar>
          <DiracLogo />
        </Toolbar>
        {/* Map over user sections and render them as list items in the drawer. */}
        <List>
          {userSections.map((group) => (
            <ListItem key={group.title} disablePadding>
              <DrawerItemGroup group={group} setSections={setSections} />
            </ListItem>
          ))}
        </List>
        {/* Render a link to documentation, positioned at the bottom of the drawer. */}
        <List style={{ position: "absolute", bottom: "0" }}>
          <ListItem key={"Documentation"}>
            <ListItemButton
              target="_blank"
              href="https://dirac.readthedocs.io/en/latest/"
            >
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary={"Documentation"} />
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
}
