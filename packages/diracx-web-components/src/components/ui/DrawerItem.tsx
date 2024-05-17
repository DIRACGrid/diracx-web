import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ListItemButton,
  ListItemIcon,
  Icon,
  ListItemText,
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
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useMUITheme } from "@/hooks/theme";
import { useSearchParamsUtils } from "@/hooks/searchParamsUtils";
import { useApplicationId } from "@/hooks/application";

/**
 * Represents a drawer item component.
 *
 * @param item - The item object containing the title, id, and icon.
 * @param index - The index of the item.
 * @param groupTitle - The title of the group.
 * @returns The rendered JSX for the drawer item.
 */
export default function DrawerItem({
  item: { title, id, icon },
  index,
  groupTitle,
}: {
  item: { title: string; id: string; icon: React.ComponentType };
  index: number;
  groupTitle: string;
}) {
  // Ref to use for the draggable element
  const dragRef = React.useRef(null);
  // Ref to use for the handle of the draggable element, must be a child of the draggable element
  const handleRef = React.useRef(null);
  const theme = useMUITheme();
  const { setParam } = useSearchParamsUtils();
  // Represents the closest edge to the mouse cursor
  const [closestEdge, setClosestEdge]: any = useState<Edge | null>(null);

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
                  <MUIThemeProvider theme={theme}>
                    <div
                      style={{
                        width: source.element.getBoundingClientRect().width,
                      }}
                    >
                      <ItemPreview title={title} icon={icon} />
                    </div>
                  </MUIThemeProvider>
                </ThemeProvider>
              );
              return () => root.unmount();
            },
            // Seamless transition between the preview and the real element
            getOffset: ({ container }) => {
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
            { input, element, allowedEdges: ["top", "bottom"] }
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
      })
    );
  }, [index, groupTitle, icon, theme, title, id]);

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
        <ListItemText primary={title} />
        <ListItemIcon sx={{ minWidth: "24px" }}>
          <Icon
            component={DragIndicator}
            sx={{ cursor: "grab" }}
            ref={handleRef}
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
      <ListItemText primary={title} />
      <ListItemIcon sx={{ minWidth: "24px" }}>
        {/* <Icon
          component={DragIndicatorIcon}
          sx={{ cursor: "grab" }}
        /> */}
      </ListItemIcon>
    </ListItemButton>
  );
}
