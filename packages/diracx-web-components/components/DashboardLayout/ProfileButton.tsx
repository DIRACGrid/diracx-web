"use client";
import { useOidc, useOidcAccessToken } from "@axa-fr/react-oidc";
import {
  Info,
  Logout,
  CorporateFare,
  Groups,
  Person,
  ExpandMore,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { cyan } from "@mui/material/colors";
import React from "react";
import { useOIDCContext } from "@/hooks/oidcConfiguration";

/**
 * Profile button, expected to vary whether the user is connected
 * @returns a Button
 */
export function ProfileButton() {
  const { configuration, setConfiguration } = useOIDCContext();
  const { accessTokenPayload } = useOidcAccessToken(configuration?.scope);
  const { logout, isAuthenticated } = useOidc(configuration?.scope);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    if (!configuration) {
      return;
    }

    // Remove the OIDC configuration name from the session storage
    setConfiguration({ ...configuration, scope: `` });
    sessionStorage.removeItem("oidcScope");
    logout();
  };

  if (!isAuthenticated) {
    return (
      <Button variant="contained" component={Link} href="/auth">
        Login
      </Button>
    );
  }

  return (
    <React.Fragment>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar sx={{ bgcolor: cyan[500] }}>
            {accessTokenPayload["preferred_username"][0]}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          <table>
            <tbody>
              <tr>
                <td>
                  <Tooltip title="Username">
                    <Person />
                  </Tooltip>
                </td>
                <td>
                  <span>{accessTokenPayload["preferred_username"]}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Tooltip title="Group">
                    <Groups />
                  </Tooltip>
                </td>
                <td>
                  <span>{accessTokenPayload["dirac_group"]}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Tooltip title="VO">
                    <CorporateFare />
                  </Tooltip>
                </td>
                <td>
                  <span>{accessTokenPayload["vo"]}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </MenuItem>
        <MenuItem>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Properties</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1} flexWrap="wrap">
                {accessTokenPayload["dirac_properties"]?.map(
                  (property: string, index: number) => (
                    <Chip key={index} label={property} sx={{ m: 0.5 }} />
                  ),
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
          }}
        >
          <ListItemIcon>
            <Info fontSize="small" />
          </ListItemIcon>
          About
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            handleLogout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
