"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ListItemButton,
  ListItemIcon,
  Icon,
  ListItemText,
  useTheme,
  TextField,
} from "@mui/material";
import { DragIndicator } from "@mui/icons-material";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {
  Edge,
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import { useSearchParamsUtils } from "../../hooks/searchParamsUtils";
import { useApplicationId } from "../../hooks/application";
import { DashboardGroup } from "../../types";

interface DrawerItemProps {
  /** The item object containing the title, id, and icon. */
  item: { title: string; id: string; icon: React.ComponentType };
  /** The index of the item. */
  index: number;
  /** The title of the group. */
  groupTitle: string;
  /** The ID of the item being renamed. */
  renamingItemId: string | null;
  /** The function to set the renaming item ID. */
  setRenamingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  /** The value of the rename input. */
  renameValue: string;
  /** The function to set the rename input value. */
  setRenameValue: React.Dispatch<React.SetStateAction<string>>;
  /** The function to set the user dashboard state. */
  setUserDashboard: React.Dispatch<React.SetStateAction<DashboardGroup[]>>;
}

/**
 * Represents a drawer item component.
 *
 * @returns The rendered JSX for the drawer item.
 */
export default function DrawerItem({
  item: { title, id, icon },
  index,
  groupTitle,
  renamingItemId,
  setRenamingItemId,
  renameValue,
  setRenameValue,
  setUserDashboard,
}: DrawerItemProps) {
  // Ref to use for the draggable element
  const dragRef = useRef(null);
  // Ref to use for the handle of the draggable element, must be a child of the draggable element
  const handleRef = useRef(null);
  const theme = useTheme();
  const { setParam } = useSearchParamsUtils();
  // Represents the closest edge to the mouse cursor
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const appId = useApplicationId();

  useEffect(() => {
    if (!dragRef.current || !handleRef.current) return;
    const element = dragRef.current;
    const handleItem = handleRef.current;

    return combine(
      // makes the item draggable
      draggable({
        element: element,
        dragHandle: handleItem,
        // Sets the initial data for the drag and drop interaction
        getInitialData: () => ({ index, title: groupTitle }),
        // Sets a lightweight version of the real item as a preview
        onGenerateDragPreview: ({ nativeSetDragImage, source, location }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render: ({ container }) => {
              const root = createRoot(container);
              root.render(
                // Wraps the preview in the theme provider to ensure the correct theme is applied
                // This is necessary because the preview is rendered outside the main app
                <ThemeProvider>
                  <div
                    style={{
                      width: source.element.getBoundingClientRect().width,
                    }}
                  >
                    <ItemPreview title={title} icon={icon} />
                  </div>
                </ThemeProvider>,
              );
              return () => root.unmount();
            },
            // Seamless transition between the preview and the real element
            getOffset: () => {
              const elementPos = source.element.getBoundingClientRect();
              const x = location.current.input.pageX - elementPos.x;
              const y = location.current.input.pageY - elementPos.y;
              return { x, y };
            },
          });
        },
      }),
      // Makes the item a target for dragged elements. Attach the closest edge data and highlight the destination when hovering over the item
      dropTargetForElements({
        element: element,
        getData: ({ input, element }) => {
          return attachClosestEdge(
            { index, title: groupTitle },
            { input, element, allowedEdges: ["top", "bottom"] },
          );
        },
        onDrag({ self, source }) {
          const isSource = source.element === element;
          if (isSource) {
            setClosestEdge(null);
            return;
          }
          const closestEdge = extractClosestEdge(self.data);

          const sourceIndex = source.data.index;
          if (typeof sourceIndex === "number") {
            const isItemBeforeSource =
              index === sourceIndex - 1 && source.data.title === title;
            const isItemAfterSource =
              index === sourceIndex + 1 && source.data.title === title;

            const isDropIndicatorHidden =
              (isItemBeforeSource && closestEdge === "bottom") ||
              (isItemAfterSource && closestEdge === "top");

            if (isDropIndicatorHidden) {
              setClosestEdge(null);
              return;
            }
          }
          setClosestEdge(closestEdge);
        },
        onDragLeave() {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      }),
    );
  }, [index, groupTitle, icon, theme, title, id]);

  // Handle renaming of the item
  const handleItemRename = () => {
    if (renameValue.trim() === "") return;
    setUserDashboard((groups) =>
      groups.map((group) => {
        if (group.title === groupTitle) {
          return {
            ...group,
            items: group.items.map((item) =>
              item.id === id ? { ...item, title: renameValue } : item,
            ),
          };
        }
        return group;
      }),
    );
    setRenamingItemId(null);
    setRenameValue("");
  };

  return (
    <>
      <ListItemButton
        disableGutters
        key={title}
        onClick={() => setParam("appId", id)}
        sx={{ pl: 2, borderRadius: 2, pr: 1 }}
        ref={dragRef}
        selected={appId === id}
      >
        <ListItemIcon>
          <Icon component={icon} />
        </ListItemIcon>
        {renamingItemId === id ? (
          <TextField
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleItemRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleItemRename();
              } else if (e.key === "Escape") {
                setRenamingItemId(null);
              }
            }}
            autoFocus
            size="small"
          />
        ) : (
          <ListItemText
            primary={title}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        )}
        <ListItemIcon sx={{ minWidth: "24px" }}>
          <Icon
            component={DragIndicator}
            sx={{ cursor: "grab" }}
            ref={handleRef}
            data-testid="drag-handle"
          />
        </ListItemIcon>
        {closestEdge && <DropIndicator edge={closestEdge} />}
      </ListItemButton>
    </>
  );
}

/**
 * Lightweight preview of an item in the drawer.
 * Used when dragging an item to give a visual representation of it with minimal resources.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the item.
 * @param {React.ComponentType} props.icon - The icon component for the item.
 * @returns {JSX.Element} The rendered item preview.
 */
function ItemPreview({
  title,
  icon,
}: {
  title: string;
  icon: React.ComponentType;
}) {
  return (
    <ListItemButton
      disableGutters
      key={title}
      sx={{
        pl: 2,
        borderRadius: 2,
        pr: 1,
        backgroundColor: "rgba(100, 100, 100, 0.2)",
      }}
    >
      <ListItemIcon>
        <Icon component={icon} />
      </ListItemIcon>
      <ListItemText
        primary={title}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      />
      <ListItemIcon sx={{ minWidth: "24px" }}>
        <Icon component={DragIndicator} sx={{ cursor: "grab" }} />
      </ListItemIcon>
    </ListItemButton>
  );
}
