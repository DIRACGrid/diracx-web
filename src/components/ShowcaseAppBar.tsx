"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { DiracLogo } from "./DiracLogo";
import { LoginButton } from "./LoginButton";
import { Stack } from "@mui/material";
import { DashboardButton } from "./DashboardButton";
import Image from "next/image";

/**
 * Controls the response due to a scrolling
 * @param props - children
 * @returns an elevation of the children component
 */
function ElevationScroll(props: Props) {
  const { children } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

/**
 * Build the showcase content with an AppBar
 * @param props - children
 * @returns showcase content
 */
export default function ShowcaseAppBar(props: Props) {
  const Item = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    elevation: 0,
  }));

  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar sx={{ bgcolor: "white" }}>
          <Stack direction="row">
            <Toolbar>
              <DiracLogo />
            </Toolbar>
            <Toolbar
              sx={{
                justifyContent: "space-between",
                flexGrow: 1,
              }}
            >
              <div />
              <Stack direction="row">
                <DashboardButton />
                <LoginButton />
              </Stack>
            </Toolbar>
          </Stack>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid item xs={6} md={4}>
          <Item>
            The DIRAC interware is a software framework that enables communities
            to interact with distributed computing resources. DIRAC forms a
            layer between users and resources, hiding diversities across
            computing and storage resources.
          </Item>
        </Grid>
        <Grid item xs={6} md={6}>
          <Image
            src="/showcase1.png"
            alt="DIRAC logo"
            width={400}
            height={400}
          />
        </Grid>
        <Grid item xs={6} md={6}>
          <Image
            src="/showcase2.png"
            alt="DIRAC logo"
            width={400}
            height={400}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>
            DIRAC has been adopted by several HEP and non-HEP experiments
            communities, with different goals, intents, resources and workflows:
            it is experiment agnostic, extensible, and flexible.
          </Item>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
