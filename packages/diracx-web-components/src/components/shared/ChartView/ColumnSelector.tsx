import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  InputLabel,
  MenuItem,
  FormControl,
  Tooltip,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import RestoreIcon from "@mui/icons-material/Restore";
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

interface SelectColumnsProps {
  /** The row data*/
  columnList: string[];
  /** The columns used in the group by */
  groupColumns: string[];
  /** Setter for groupColumns */
  setGroupColumns: React.Dispatch<React.SetStateAction<string[]>>;
  /** The current path in the tree */
  currentPath: string[];
  /** Setter for the current path in the tree */
  setCurrentPath: React.Dispatch<React.SetStateAction<string[]>>;
  /** Default columns to use */
  defaultColumns: string[];
  /** Optional title for the column selector */
  title?: string;
}

/**
 * This component is used to select the columns to be used in the group by
 *
 * @param props See SelectColumnProps for more detials
 * @see {@link SelectColumnProps}
 * @returns A table which managed the group by on the columns
 */
export function ColumnSelector({
  columnList,
  groupColumns,
  setGroupColumns,
  currentPath,
  setCurrentPath,
  defaultColumns: defaultGroupColumns,
  title = "Column Selector",
}: SelectColumnsProps) {
  /**
   * Change the columns used for the group by
   *
   * @param event The event which triggers the change
   * @param depth The depth in the tree
   */
  const handleChange = (event: SelectChangeEvent<string>, depth: number) => {
    let newGroups = [...groupColumns];
    if (event.target.value === "None") {
      // Delete a column
      newGroups = newGroups.filter((_elt, index) => index !== depth);
      if (newGroups.length > 0 && currentPath.length > depth)
        setCurrentPath((currentPath) =>
          currentPath.slice(0, Math.max(0, depth - 1)),
        );
    } else {
      // Add or change a column
      if (newGroups[depth]) {
        // Change the column
        newGroups[depth] = event.target.value;
        if (currentPath.length > depth)
          setCurrentPath((currentPath) => currentPath.slice(0, depth));
      } else {
        // Add a column
        newGroups.push(event.target.value);
      }
    }
    setGroupColumns(newGroups);
  };

  /**
   * Reorder columns based on drag and drop
   *
   * @param fromIndex The original index
   * @param toIndex The target index
   */
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newColumns = [...groupColumns];

    // Only move existing columns (not the "add new" one)
    if (fromIndex < newColumns.length) {
      // Remove the item from its original position
      const [movedItem] = newColumns.splice(fromIndex, 1);

      newColumns.splice(toIndex, 0, movedItem);
      setGroupColumns(newColumns);

      // Reset the current path since we changed the hierarchy
      setCurrentPath([]);
    }
  };

  const resetColumnsToPlot = () => {
    setGroupColumns(defaultGroupColumns);
    setCurrentPath([]);
  };

  /** A arrray with one cell per column in the group by */
  const additionalChoice = [];

  for (let i = 0; i < groupColumns.length + 1; i++) {
    const availableColumns = columnList.filter(
      (column) => column === groupColumns[i] || !groupColumns.includes(column),
    );

    additionalChoice.push(
      <ColumnSelect
        key={`cat-${i}`}
        groupColumns={groupColumns}
        index={i}
        handleChange={handleChange}
        availableColumns={availableColumns}
        onReorder={handleReorder}
      />,
    );
  }

  return (
    <Box
      sx={{
        gap: 1,
        width: 1,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
      data-testid="column-selector"
    >
      <Card
        variant="outlined"
        sx={{ padding: 2, minHeight: "200px", width: 1 }}
      >
        <Tooltip title="Select the columns to be used in the group by">
          <Typography variant="h5" textAlign={"center"} mb={2}>
            {title}
          </Typography>
        </Tooltip>
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          {additionalChoice}
        </Box>
        <div>
          <Button
            color="primary"
            startIcon={<RestoreIcon />}
            onClick={resetColumnsToPlot}
          >
            Reset columns
          </Button>
        </div>
      </Card>
    </Box>
  );
}

interface ColumnSelectProps {
  /** The columns used in the group by */
  groupColumns: string[];
  /** The index of the column in the group by */
  index: number;
  /** Function to handle the change of the column */
  handleChange: (event: SelectChangeEvent<string>, index: number) => void;
  /** The available columns to select from */
  availableColumns: string[];
  /** Function to handle the reordering of the columns */
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function ColumnSelect({
  groupColumns,
  index,
  handleChange,
  availableColumns,
  onReorder,
}: ColumnSelectProps) {
  // Ref to use for the draggable element
  const dragRef = useRef<HTMLDivElement>(null);
  // Ref to use for the handle of the draggable element
  const handleRef = useRef<HTMLDivElement>(null);
  // Represents the closest edge to the mouse cursor
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const isLastItem = index === groupColumns.length;

  useEffect(() => {
    if (!dragRef.current || !handleRef.current || isLastItem) return;

    const element = dragRef.current;
    const handleElement = handleRef.current;

    return combine(
      // Makes the element draggable
      draggable({
        element,
        dragHandle: handleElement,
        getInitialData: () => ({ index }),
      }),

      // Makes the element a drop target
      dropTargetForElements({
        element,
        getData: ({ input, element }) => {
          return attachClosestEdge(
            { index },
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
            const isItemBeforeSource = index === sourceIndex - 1;
            const isItemAfterSource = index === sourceIndex + 1;

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
        onDrop({ self, source }) {
          const closestEdge = extractClosestEdge(self.data);
          const fromIndex = source.data.index as number;
          let toIndex = index;

          if (closestEdge === "bottom") {
            toIndex = index + 1;
          }

          // Only reorder if from and to indexes are different
          if (fromIndex != undefined && toIndex !== fromIndex) {
            onReorder(fromIndex, toIndex);
          }

          setClosestEdge(null);
        },
      }),
    );
  }, [index, isLastItem, onReorder]);

  return (
    <Box
      ref={dragRef}
      sx={{
        position: "relative",
        mb: 1,
        display: "flex",
        alignItems: "center",
        borderRadius: 1,
        "&:hover": {
          bgcolor: isLastItem ? "transparent" : "rgba(0,0,0,0.05)",
        },
      }}
    >
      {!isLastItem && (
        <Box
          ref={handleRef}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "grab",
            p: 1,
            color: "text.secondary",
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}

      {isLastItem && <Box sx={{ width: 40 }} />}

      <FormControl sx={{ m: 1, minWidth: 120, flex: 1 }} key={`cat-${index}`}>
        <InputLabel id={`cat${index + 1}-label`}>Level {index + 1}</InputLabel>
        <Select
          value={groupColumns[index] || "None"}
          onChange={(event) => handleChange(event, index)}
          autoWidth={true}
          variant="standard"
        >
          <MenuItem key="None" value="None">
            None
          </MenuItem>
          {availableColumns.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {closestEdge && <DropIndicator edge={closestEdge} />}
    </Box>
  );
}
