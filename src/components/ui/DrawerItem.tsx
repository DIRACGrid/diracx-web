import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import {
  ListItemButton,
  ListItemIcon,
  Icon,
  ListItemText,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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

export default function DrawerItem({
  item: { title, id, icon },
  index,
  groupTitle,
}: {
  item: { title: string; id: string; icon: React.ComponentType };
  index: number;
  groupTitle: string;
}) {
  const dragRef = React.useRef(null);
  const handleRef = React.useRef(null);
  const theme = useMUITheme();
  const { setParam } = useSearchParamsUtils();

  const [closestEdge, setClosestEdge]: any = useState<Edge | null>(null);

  useEffect(() => {
    if (!dragRef.current || !handleRef.current) return;
    const element = dragRef.current;
    const handleItem = handleRef.current;

    return combine(
      draggable({
        element: element,
        dragHandle: handleItem,
        getInitialData: () => ({ index, title: groupTitle }),
        onGenerateDragPreview: ({ nativeSetDragImage, source, location }) => {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            render: ({ container }) => {
              const root = createRoot(container);
              root.render(
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
                </ThemeProvider>,
              );
              return () => root.unmount();
            },
            getOffset: ({ container }) => {
              const elementPos = source.element.getBoundingClientRect();
              const x = location.current.input.pageX - elementPos.x;
              const y = location.current.input.pageY - elementPos.y;
              return { x, y };
            },
          });
        },
      }),
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

  return (
    <>
      <ListItemButton
        disableGutters
        key={title}
        onClick={() => setParam("appId", id)}
        sx={{ pl: 2, borderRadius: 2, pr: 1 }}
        ref={dragRef}
      >
        <ListItemIcon>
          <Icon component={icon} />
        </ListItemIcon>
        <ListItemText primary={title} />
        <ListItemIcon sx={{ minWidth: "24px" }}>
          <Icon
            component={DragIndicatorIcon}
            sx={{ cursor: "grab" }}
            ref={handleRef}
          />
        </ListItemIcon>
        {closestEdge && <DropIndicator edge={closestEdge} />}
      </ListItemButton>
    </>
  );
}

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
        <Icon component={DragIndicatorIcon} sx={{ cursor: "grab" }} />
      </ListItemIcon>
    </ListItemButton>
  );
}
