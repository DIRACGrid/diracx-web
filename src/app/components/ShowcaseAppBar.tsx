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

export default function ShowcaseAppBar(props: Props) {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
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
              <LoginButton />
            </Toolbar>
          </Stack>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid item xs={6} md={8}>
          <Item>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros. Praesent commodo cursus
            magna, vel scelerisque nisl consectetur et. Cras mattis consectetur
            purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
            egestas eget quam. Morbi leo risus, porta ac consectetur ac,
            vestibulum at eros. Praesent commodo cursus magna, vel scelerisque
            nisl consectetur et. Cras mattis consectetur purus sit amet
            fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
            quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
          </Item>
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>Image</Item>
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>Image</Item>
        </Grid>
        <Grid item xs={6} md={8}>
          <Item>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros. Praesent commodo cursus
            magna, vel scelerisque nisl consectetur et. Cras mattis consectetur
            purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
            egestas eget quam. Morbi leo risus, porta ac consectetur ac,
            vestibulum at eros. Praesent commodo cursus magna, vel scelerisque
            nisl consectetur et. Cras mattis consectetur purus sit amet
            fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget
            quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
          </Item>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
