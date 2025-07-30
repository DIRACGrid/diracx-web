import { useState, useContext } from "react";
import { MuiMarkdown, defaultOverrides } from "mui-markdown";
import { emojify } from "node-emoji";

import {
  Box,
  Typography,
  ListItemButton,
  IconButton,
  List,
  ListItemText,
  Divider,
  Modal,
  Collapse,
  useTheme,
} from "@mui/material";

import { grey } from "@mui/material/colors";

import CloseIcon from "@mui/icons-material/Close";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { ApplicationsContext } from "../../contexts";

/**
 *
 * @param isOpen Boolean indicating if the help page is open
 * @param closeHelp Function to close the help page
 * @returns Component to display the help overlay with user documentation
 */
export default function HelpOverlay({
  isOpen,
  closeHelp,
}: {
  isOpen: boolean;
  closeHelp: () => void;
}) {
  const [selected, setSelected] = useState<string>("general");
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});

  const userDocumentation = useContext(ApplicationsContext)[5];
  const theme = useTheme();

  const backgroundColor = theme.palette.mode === "dark" ? grey[900] : grey[50];

  const customOverrides = {
    ...defaultOverrides,
    h1: {
      component: Typography,
      props: {
        variant: "h3",
        gutterBottom: true,
        sx: {
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
        },
      } as React.HTMLProps<HTMLHeadingElement>,
    },
    h2: {
      component: Typography,
      props: {
        variant: "h4",
        gutterBottom: true,
        sx: {
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
      } as React.HTMLProps<HTMLHeadingElement>,
    },
    h3: {
      component: Typography,
      props: {
        variant: "h5",
        gutterBottom: true,
        sx: {
          marginTop: "1rem",
          marginBottom: "0.25rem",
        },
      } as React.HTMLProps<HTMLHeadingElement>,
    },
    p: {
      component: Typography,
      props: {
        paragraph: true,
      } as React.HTMLProps<HTMLParagraphElement>,
    },
  };
  // Handle application section toggle
  const toggleApp = (appName: string) => {
    setExpandedApps((prev) => ({
      ...prev,
      [appName]: !prev[appName],
    }));
  };

  // Render content based on selected item
  const RenderContent = () => {
    if (selected === "general") {
      return (
        <>
          <MuiMarkdown overrides={customOverrides}>
            {emojify(userDocumentation.generalUsage)}
          </MuiMarkdown>
        </>
      );
    }

    const [appName, sectionTitle] = selected.split("::");
    const app = userDocumentation.applications.find(
      (a) => a.appName === appName,
    );
    const section = app?.sections.find((s) => s.title === sectionTitle);

    return (
      <>
        <MuiMarkdown overrides={customOverrides}>
          {emojify(section?.content || "")}
        </MuiMarkdown>
      </>
    );
  };

  return (
    <Modal open={isOpen} onClose={closeHelp}>
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          width: "80vw",
          height: "80vh",
          bgcolor: backgroundColor,
          borderRadius: 2,
          overflow: "hidden",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Left vertical menu */}
        <IconButton
          onClick={closeHelp}
          sx={{ position: "absolute", top: 8, right: 8 }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{ width: 250, borderRight: "1px solid #ddd", overflowY: "auto" }}
        >
          <List>
            <ListItemButton
              selected={selected === "general"}
              onClick={() => setSelected("general")}
            >
              <ListItemText primary="General Usage" />
            </ListItemButton>
            <Divider />
            {userDocumentation.applications.map((app, index) => (
              <Box key={index}>
                <ListItemButton onClick={() => toggleApp(app.appName)}>
                  <ListItemText primary={app.appName} />
                  {expandedApps[app.appName] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse
                  in={expandedApps[app.appName]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {app.sections.map((section) => (
                      <ListItemButton
                        key={section.title}
                        sx={{ pl: 4 }}
                        selected={
                          selected === `${app.appName}::${section.title}`
                        }
                        onClick={() =>
                          setSelected(`${app.appName}::${section.title}`)
                        }
                      >
                        <ListItemText primary={section.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </Box>

        {/* Right content pane */}
        <Box sx={{ flex: 1, p: 4, overflowY: "auto" }}>{RenderContent()}</Box>
      </Box>
    </Modal>
  );
}
