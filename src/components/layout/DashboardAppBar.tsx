"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import { LoginButton } from "../ui/LoginButton";
import DashboardDrawer from "./DashboardDrawer";

interface DashboardAppBarProps {
  children: React.ReactNode;
}

/**
 * Build a side bar on the left containing the available sections as well as a top bar.
 * The side bar is expected to collapse if displayed on a small screen
 *
 * @param props - children
 * @return an dashboard layout
 */
export default function DashboardAppBar(props: DashboardAppBarProps) {
  /** State management for mobile drawer */
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /** Drawer width */
  const drawerWidth = 240;

  /** Drawer component: a logo, a list of sections and a link to the documentation */
  const container =
    window !== undefined ? () => window.document.body : undefined;

  const renderDrawer = (variant: "permanent" | "temporary") => {
    const isTemporary = variant === "temporary";

    return (
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
            width: drawerWidth,
          },
        }}
      >
        <DashboardDrawer />
      </Drawer>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
        }}
      >
        <Stack direction="row">
          <Toolbar>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
          <Toolbar
            sx={{
              justifyContent: "space-between",
              flexGrow: 1,
            }}
          >
            <div />
            <LoginButton />
          </Toolbar>
        </Stack>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="side bar"
      >
        {renderDrawer("temporary")}
        {renderDrawer("permanent")}
      </Box>
      <Box
        component="main"
        sx={{ pt: 10, px: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {props.children}
      </Box>
    </Box>
  );
}
