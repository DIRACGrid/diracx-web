"use client";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Menu } from "@mui/icons-material";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { ProfileButton } from "./ProfileButton";
import { ThemeToggleButton } from "./ThemeToggleButton";
import DashboardDrawer from "./DashboardDrawer";
import { useApplicationTitle, useApplicationType } from "@/hooks/application";

interface DashboardProps {
  /** The content to be displayed in the main area */
  children: React.ReactNode;
  /** The width of the drawer, default to 240 */
  drawerWidth?: number;
  /** The URL of the logo to be displayed in the drawer */
  logoURL?: string;
}

/**
 * Build a side bar on the left containing the available groups as well as a top bar.
 * The side bar is expected to collapse if displayed on a small screen
 *
 * @param props - children, drawerWidth, logoURL
 * @return an dashboard layout
 */
export default function Dashboard({
  children,
  drawerWidth = 240,
  logoURL,
}: DashboardProps) {
  const appTitle = useApplicationTitle();
  const appType = useApplicationType();

  /** Theme and media query */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /** State management for mobile drawer */
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {isMobile && (
            <Toolbar>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { sm: "none" } }}
                data-testid="drawer-toggle-button"
              >
                <Menu />
              </IconButton>
            </Toolbar>
          )}

          <Stack
            spacing={1}
            direction={"row"}
            alignItems={"end"}
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <Typography
              color="text.primary"
              variant={isMobile ? "h6" : "h4"}
              fontWeight={"bold"}
              width={"fit-content"}
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                paddingLeft: 2,
              }}
            >
              {appTitle}
            </Typography>
            <Typography
              color="text.secondary"
              variant={isMobile ? "body2" : "subtitle1"}
              width={"fit-content"}
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {appType}
            </Typography>
          </Stack>

          <Toolbar
            sx={{
              justifyContent: "flex-end",
              flexGrow: 0,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ThemeToggleButton />
              <ProfileButton />
            </Stack>
          </Toolbar>
        </Stack>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="side bar"
      >
        <DashboardDrawer
          variant={isMobile ? "temporary" : "permanent"}
          mobileOpen={mobileOpen}
          width={drawerWidth}
          handleDrawerToggle={handleDrawerToggle}
          logoURL={logoURL}
        />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
