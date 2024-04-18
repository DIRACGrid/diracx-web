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
import React, {
  ComponentType,
  ReactEventHandler,
  useEffect,
  useState,
} from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
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

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }
        const sourceData = source.data;
        const targetData = target.data;

        if (location.current.dropTargets.length == 2) {
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
  }, [userSections]);

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
        destinationIndex -= 1;
      }
      if (
        sourceGroup.title === destinationGroup.title &&
        (destinationIndex == null || sourceIndex === destinationIndex)
      ) {
        return;
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
