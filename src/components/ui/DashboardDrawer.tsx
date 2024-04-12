import { usePathname } from "next/navigation";
import NextLink from "next/link";
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
import { ReactEventHandler } from "react";
import { DiracLogo } from "./DiracLogo";

// Define the sections that are accessible to users.
// Each section has an associated icon and path.
const userSections: Record<
  string,
  { icon: React.ComponentType; path: string }
> = {
  Dashboard: { icon: Dashboard, path: "/" },
  "Job Monitor": { icon: MonitorIcon, path: "/jobmonitor" },
  "File Catalog": { icon: FolderCopy, path: "/filecatalog" },
};

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
          {Object.keys(userSections).map((title: string) => (
            <ListItem key={title} disablePadding>
              <ListItemButton
                component={NextLink}
                href={userSections[title]["path"]}
                selected={pathname === userSections[title]["path"]}
              >
                <ListItemIcon>
                  <Icon component={userSections[title]["icon"]} />
                </ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
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
