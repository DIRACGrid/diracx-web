import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Icon,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import Link from "next/link";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

export default function DrawerItemGroup({
  group: { title, extended: expanded, items },
  setSections,
}: {
  group: {
    title: string;
    extended: boolean;
    items: {
      title: string;
      id: number;
      icon: React.ComponentType;
      path: string;
    }[];
  };
  setSections: React.Dispatch<
    React.SetStateAction<
      {
        title: string;
        extended: boolean;
        items: {
          title: string;
          id: number;
          icon: React.ComponentType;
          path: string;
        }[];
      }[]
    >
  >;
}) {
  const handleChange = (title: string) => (event: any, isExpanded: any) => {
    // Set the extended state of the accordion group.
    setSections((sections) =>
      sections.map((section) =>
        section.title === title
          ? { ...section, extended: isExpanded }
          : section,
      ),
    );
  };

  return (
    <Accordion
      sx={{
        width: "100%",
        "& .MuiAccordion-region": { height: expanded ? "auto" : 0 },
        "& .MuiAccordionDetails-root": { display: expanded ? "block" : "none" },
      }}
      expanded={expanded}
      onChange={handleChange(title)}
      disableGutters
    >
      {/* Accordion summary */}
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {title}
      </AccordionSummary>
      {/* Accordion details */}
      <AccordionDetails>
        {items.map(({ title, id, icon, path }, index) => (
          <ListItemButton
            disableGutters
            key={title}
            component={Link}
            href={path}
            sx={{ pl: 2, borderRadius: 2, pr: 1 }}
          >
            <ListItemIcon>
              <Icon component={icon} />
            </ListItemIcon>
            <ListItemText primary={title} />
            <div>
              <Icon component={DragIndicatorIcon} />
            </div>
          </ListItemButton>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
