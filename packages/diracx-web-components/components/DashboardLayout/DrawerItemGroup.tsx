"use client";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
} from "@mui/material";
import { ExpandMore, Apps } from "@mui/icons-material";
import React, { useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import DrawerItem from "./DrawerItem";
import { DashboardGroup } from "@/types/DashboardGroup";

/**
 * Represents a group of items in a drawer.
 *
 * @component
 * @param {Object} props - The component props.
 * @returns {JSX.Element} The rendered DrawerItemGroup component.
 */
export default function DrawerItemGroup({
  group: { title, extended: expanded, items },
  setUserDashboard,
  handleContextMenu,
  renamingGroupId,
  setRenamingGroupId,
  renamingItemId,
  setRenamingItemId,
  renameValue,
  setRenameValue,
}: {
  /** The group object containing the title, expanded state, and items. */
  group: DashboardGroup;
  /** The function to set the user dashboard state. */
  setUserDashboard: React.Dispatch<React.SetStateAction<DashboardGroup[]>>;
  /** The function to handle the context menu. */
  handleContextMenu: (
    type: "group" | "item" | null,
    id: string | null,
  ) => (event: React.MouseEvent<HTMLElement>) => void;
  /** The ID of the group being renamed. */
  renamingGroupId: string | null;
  /** The function to set the renaming group ID. */
  setRenamingGroupId: React.Dispatch<React.SetStateAction<string | null>>;
  /** The ID of the item being renamed. */
  renamingItemId: string | null;
  /** The function to set the renaming item ID. */
  setRenamingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  /** The value of the rename input. */
  renameValue: string;
  /** The function to set the rename input value. */
  setRenameValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  // Ref to use for the drag and drop target
  const dropRef = React.useRef(null);
  // State to track whether the user is hovering over the item during a drag operation
  const [hovered, setHovered] = React.useState(false);

  useEffect(() => {
    if (!dropRef.current) return;
    const dropItem = dropRef.current;

    // Makes the element a valid drop target, sets up the data transfer and manage the hovered state
    return dropTargetForElements({
      element: dropItem,
      getData: () => ({ title }),
      onDragStart: () => setHovered(true),
      onDrop: () => {
        setHovered(false);
        handleChange(title)({} as React.ChangeEvent<unknown>, true);
      },
      onDragEnter: () => setHovered(true),
      onDragLeave: () => setHovered(false),
    });
  });

  // Handles expansion of the accordion group
  const handleChange =
    (title: string) => (_: React.ChangeEvent<unknown>, isExpanded: boolean) => {
      // Set the extended state of the accordion group.
      setUserDashboard((groups) =>
        groups.map((group) =>
          group.title === title ? { ...group, extended: isExpanded } : group,
        ),
      );
    };

  // Handle renaming of the group
  const handleGroupRename = () => {
    if (renameValue.trim() === "") return;
    setUserDashboard((groups) =>
      groups.map((group) =>
        group.title === title ? { ...group, title: renameValue } : group,
      ),
    );
    setRenamingGroupId(null);
    setRenameValue("");
  };

  return (
    <Accordion
      sx={{
        width: "100%",
        backgroundColor: hovered ? "rgba(0, 30, 100, 0.3)" : "transparent",
      }}
      expanded={expanded}
      onChange={handleChange(title)}
      disableGutters
      ref={dropRef}
    >
      {/* Accordion summary */}
      <AccordionSummary expandIcon={<ExpandMore />}>
        {renamingGroupId === title ? (
          <TextField
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleGroupRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGroupRename();
              } else if (e.key === "Escape") {
                setRenamingGroupId(null);
              }
            }}
            autoFocus
            size="small"
          />
        ) : (
          <div onContextMenu={handleContextMenu("group", title)}>{title}</div>
        )}
      </AccordionSummary>
      {/* Accordion details */}
      <AccordionDetails>
        {items.map(({ title: itemTitle, id, icon }, index) => (
          <div onContextMenu={handleContextMenu("item", id)} key={id}>
            <DrawerItem
              item={{ title: itemTitle, id, icon: icon || Apps }}
              index={index}
              groupTitle={title}
              renamingItemId={renamingItemId}
              setRenamingItemId={setRenamingItemId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              setUserDashboard={setUserDashboard}
            />
          </div>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
