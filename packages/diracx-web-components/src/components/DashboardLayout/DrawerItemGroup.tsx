"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DashboardGroup } from "../../types/DashboardGroup";
import DrawerItem from "./DrawerItem";

interface DrawerItemGroupProps {
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
}

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
}: DrawerItemGroupProps) {
  // Ref to use for the drag and drop target
  const dropRef = useRef(null);
  // State to track whether the user is hovering over the item during a drag operation
  const [hovered, setHovered] = useState(false);

  // Sets the extended state of an accordion group; shared by the accordion
  // onChange handler and the drag-and-drop drop handler.
  // setUserDashboard is a state setter, so this callback identity is stable.
  const setGroupExpanded = useCallback(
    (groupTitle: string, isExpanded: boolean) => {
      setUserDashboard((groups) =>
        groups.map((group) =>
          group.title === groupTitle
            ? { ...group, extended: isExpanded }
            : group,
        ),
      );
    },
    [setUserDashboard],
  );

  // Handles expansion of the accordion group
  const handleChange =
    (title: string) => (_: React.ChangeEvent<unknown>, isExpanded: boolean) =>
      setGroupExpanded(title, isExpanded);

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
        setGroupExpanded(title, true);
      },
      onDragEnter: () => setHovered(true),
      onDragLeave: () => setHovered(false),
    });
  }, [title, setGroupExpanded]);

  // Handle renaming of the group
  const handleGroupRename = () => {
    if (renameValue.trim() === "" || renameValue === title) return;
    setUserDashboard((groups) => {
      const count = groups.reduce(
        (sum, group) => (group.title.startsWith(renameValue) ? sum + 1 : sum),
        0,
      );
      const newTitle = count > 0 ? `${renameValue} (${count})` : renameValue;
      return groups.map((group) =>
        group.title === title ? { ...group, title: newTitle } : group,
      );
    });
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
            // The rename field only appears in direct response to a user
            // action (context-menu "Rename"), so moving focus into it is
            // the expected behavior, not a focus steal.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            size="small"
          />
        ) : (
          <div onContextMenu={handleContextMenu("group", title)}>{title}</div>
        )}
      </AccordionSummary>
      {/* Accordion details */}
      <AccordionDetails>
        {items.map((item, index) => (
          <div onContextMenu={handleContextMenu("item", item.id)} key={item.id}>
            <DrawerItem
              item={item}
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
