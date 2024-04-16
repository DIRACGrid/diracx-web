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
import { Draggable, Droppable } from "react-beautiful-dnd";
import React from "react";
import Link from "next/link";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { StrictModeDroppable } from "./StrictModeDroppable";

export default function DrawerItemGroup({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    id: number;
    icon: React.ComponentType;
    path: string;
  }[];
}) {
  return (
    <Accordion sx={{ width: "100%" }} disableGutters>
      {/* Accordion summary */}
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {title}
      </AccordionSummary>
      {/* Accordion details */}
      <StrictModeDroppable droppableId={title}>
        {(provided, snapshot) => (
          <AccordionDetails
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map(({ title, id, icon, path }, index) => (
              <Draggable key={id} draggableId={title} index={index}>
                {(provided) => (
                  <div>
                    <ListItemButton
                      disableGutters
                      ref={provided.innerRef}
                      key={title}
                      component={Link}
                      href={path}
                      sx={{ pl: 2, borderRadius: 2, pr: 1 }}
                      {...provided.draggableProps}
                    >
                      <ListItemIcon>
                        <Icon component={icon} />
                      </ListItemIcon>
                      <ListItemText primary={title} />
                      <div {...provided.dragHandleProps}>
                        <Icon component={DragIndicatorIcon} />
                      </div>
                    </ListItemButton>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </AccordionDetails>
        )}
      </StrictModeDroppable>
    </Accordion>
  );
}
