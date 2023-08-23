'use client'
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { DiracLogo } from './DiracLogo';


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
  return (
    <React.Fragment>
      <CssBaseline />
      <ElevationScroll {...props}>
        <AppBar
          sx={{ bgcolor: "white" }}
        >
          <Toolbar>
            <DiracLogo/>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
      <Container>
        <Box sx={{ my: 2 }}>
          { props.children }
        </Box>
      </Container>
    </React.Fragment>
  );
}