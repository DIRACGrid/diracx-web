import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import DrawerItem from "./DrawerItem";

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
  const dropRef = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);

  useEffect(() => {
    if (!dropRef.current) return;
    const dropItem = dropRef.current;

    return dropTargetForElements({
      element: dropItem,
      getData: () => ({ title }),
      onDragStart: () => setHovered(true),
      onDrop: () => {
        setHovered(false);
        handleChange(title)(null, true);
      },
      onDragEnter: () => setHovered(true),
      onDragLeave: () => setHovered(false),
    });
  });

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
  const groupTitle = title;
  return (
    <Accordion
      sx={{
        width: "100%",
        "& .MuiAccordion-region": { height: expanded ? "auto" : 0 },
        "& .MuiAccordionDetails-root": { display: expanded ? "block" : "none" },
        backgroundColor: hovered ? "rgba(0, 30, 100, 0.3)" : "transparent",
      }}
      expanded={expanded}
      onChange={handleChange(title)}
      disableGutters
      ref={dropRef}
    >
      {/* Accordion summary */}
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {title}
      </AccordionSummary>
      {/* Accordion details */}
      <AccordionDetails>
        {items.map(({ title, id, icon, path }, index) => (
          <DrawerItem
            key={id}
            item={{ title, icon, path }}
            index={index}
            groupTitle={groupTitle}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
