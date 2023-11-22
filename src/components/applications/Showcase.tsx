"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { DiracLogo } from "../ui/DiracLogo";
import { LoginButton } from "../ui/LoginButton";
import { Box, Stack } from "@mui/material";
import { DashboardButton } from "../ui/DashboardButton";
import Image from "next/image";
import { ThemeToggleButton } from "../ui/ThemeToggleButton";
import { useMUITheme } from "@/hooks/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

/**
 * Build the showcase content with an AppBar
 * @param props - children
 * @returns showcase content
 */
export default function Showcase() {
  const theme = useMUITheme();

  const Item = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6),
    elevation: 0,
  }));

  return (
    <React.Fragment>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar>
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
                <ThemeToggleButton />
                <LoginButton />
              </Stack>
            </Toolbar>
          </Stack>
        </AppBar>
        <Toolbar />
        <Box
          sx={{
            ml: { xs: "5%", md: "20%" },
            mr: { xs: "5%", md: "20%" },
          }}
        >
          <Grid container spacing={2} sx={{ my: 2 }}>
            <Grid item xs={12} md={6} lg={4}>
              <Item>
                The DIRAC interware is a software framework that enables
                communities to interact with distributed computing resources.
                DIRAC forms a layer between users and resources, hiding
                diversities across computing and storage resources.
              </Item>
            </Grid>
            <Grid item xs={12} md={6}>
              <div style={{ width: "100%", position: "relative" }}>
                <Image
                  src="/showcase1.png"
                  alt="DIRAC showcase1"
                  layout="responsive"
                  width={400}
                  height={400}
                />
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div style={{ width: "100%", position: "relative" }}>
                <Image
                  src="/showcase2.png"
                  alt="DIRAC showcase 2"
                  layout="responsive"
                  width={400}
                  height={400}
                />
              </div>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Item>
                DIRAC has been adopted by several HEP and non-HEP experiments
                communities, with different goals, intents, resources and
                workflows: it is experiment agnostic, extensible, and flexible.
              </Item>
            </Grid>
          </Grid>
        </Box>
      </MUIThemeProvider>
    </React.Fragment>
  );
}
