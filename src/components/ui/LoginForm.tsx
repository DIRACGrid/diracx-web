"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useMetadata } from "@/hooks/metadata";
import { deepOrange, lightGreen } from "@mui/material/colors";
import NextLink from "next/link";
import Image from "next/image";
import { CssBaseline, Stack } from "@mui/material";
import { OidcConfiguration, useOidc } from "@axa-fr/react-oidc";
import { useMUITheme } from "@/hooks/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useDiracxUrl } from "@/hooks/utils";

/**
 * Login form
 * @returns a form
 */
export function LoginForm() {
  const { login, isAuthenticated } = useOidc();
  const theme = useMUITheme();
  const router = useRouter();
  const { data, error, isLoading } = useMetadata();
  const [selectedVO, setSelectedVO] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<OidcConfiguration | null>(
    null,
  );
  const diracxUrl = useDiracxUrl();

  // Set OIDC configuration
  useEffect(() => {
    if (diracxUrl !== null && selectedVO !== null && selectedGroup !== null) {
      setConfiguration(() => ({
        authority: diracxUrl,
        // TODO: Figure out how to get this. Hardcode? Get from a /.well-known/diracx-configuration endpoint?
        client_id: "myDIRACClientID",
        scope: `vo:${selectedVO} group:${selectedGroup}`,
        redirect_uri: `${diracxUrl}/#authentication-callback`,
      }));
    }
  }, [diracxUrl]);

  // Set default VO if only one is available
  useEffect(() => {
    if (data) {
      const vos = Object.keys(data.virtual_organizations);
      if (vos.length === 1) {
        setSelectedVO(vos[0]);
      }
    }
  }, [data]);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  // Set group
  const handleGroupChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedGroup(value);
  };

  // Login
  const handleLogin = () => {
    login();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>An error occurred while fetching metadata.</div>;
  }
  if (!data) {
    return <div>No metadata found.</div>;
  }

  // Is there only one VO?
  const singleVO = data && Object.keys(data.virtual_organizations).length === 1;

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          ml: { xs: "5%", md: "30%" },
          mr: { xs: "5%", md: "30%" },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingTop: "10%",
            paddingBottom: "10%",
          }}
        >
          <NextLink href="/">
            <Image
              src="/DIRAC-logo-minimal.png"
              alt="DIRAC logo"
              width={150}
              height={150}
            />
          </NextLink>
        </Box>
        {singleVO ? (
          <Typography variant="h3" gutterBottom sx={{ textAlign: "center" }}>
            {selectedVO}
          </Typography>
        ) : (
          <Autocomplete
            options={Object.keys(data.virtual_organizations)}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Virtual Organization"
                variant="outlined"
              />
            )}
            value={selectedVO}
            onChange={(event: any, newValue: string | null) => {
              setSelectedVO(newValue);
            }}
            sx={{
              "& .MuiAutocomplete-root": {
                // Style changes when an option is selected
                opacity: selectedVO ? 0.5 : 1,
              },
            }}
          />
        )}
        {selectedVO && (
          <Box sx={{ mt: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Select a Group</InputLabel>
              <Select
                name={selectedVO}
                value={
                  selectedGroup ||
                  data.virtual_organizations[selectedVO].default_group
                }
                label="Select a Group"
                onChange={handleGroupChange}
              >
                {Object.keys(data.virtual_organizations[selectedVO].groups).map(
                  (groupKey) => (
                    <MenuItem key={groupKey} value={groupKey}>
                      {groupKey}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 5, width: "100%" }}
            >
              <Button
                variant="contained"
                sx={{
                  bgcolor: lightGreen[700],
                  "&:hover": { bgcolor: deepOrange[500] },
                  flexGrow: 1,
                }}
                onClick={handleLogin}
              >
                Login through your Identity Provider
              </Button>
              <Button variant="outlined" onClick={handleLogin}>
                Advanced Options
              </Button>
            </Stack>
            <Typography
              sx={{ paddingTop: "5%", color: "gray", textAlign: "center" }}
            >
              Need help?{" "}
              {data.virtual_organizations[selectedVO].support.message}
            </Typography>
          </Box>
        )}
      </Box>
    </MUIThemeProvider>
  );
}
