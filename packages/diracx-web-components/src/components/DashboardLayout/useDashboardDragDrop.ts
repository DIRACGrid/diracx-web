"use client";

import { useEffect } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DashboardGroup } from "../../types";

/**
 * Custom hook that sets up drag-and-drop monitoring for dashboard items.
 * Handles reordering items within and between groups.
 */
export default function useDashboardDragDrop(
  userDashboard: DashboardGroup[],
  setUserDashboard: React.Dispatch<React.SetStateAction<DashboardGroup[]>>,
) {
  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }
        const sourceData = source.data;
        const targetData = target.data;

        if (location.current.dropTargets.length == 2) {
          const groupTitle = targetData.title;
          const closestEdgeOfTarget = extractClosestEdge(targetData);
          const targetIndex = targetData.index as number;
          const sourceGroup = userDashboard.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userDashboard.find(
            (group) => group.title == groupTitle,
          );
          const sourceIndex = sourceData.index as number;
          const destinationIndex = (
            closestEdgeOfTarget === "top" ? targetIndex : targetIndex + 1
          ) as number;

          reorderSections(
            sourceGroup,
            targetGroup,
            sourceIndex,
            destinationIndex,
          );
        } else {
          const groupTitle = targetData.title;
          const sourceGroup = userDashboard.find(
            (group) => group.title == sourceData.title,
          );
          const targetGroup = userDashboard.find(
            (group) => group.title == groupTitle,
          );
          const sourceIndex = sourceData.index as number;

          reorderSections(sourceGroup, targetGroup, sourceIndex);
        }
      },
    });

    function reorderSections(
      sourceGroup: DashboardGroup | undefined,
      destinationGroup: DashboardGroup | undefined,
      sourceIndex: number,
      destinationIndex: number | null = null,
    ) {
      if (sourceGroup && destinationGroup) {
        if (
          sourceGroup.title === destinationGroup.title &&
          destinationIndex &&
          sourceIndex < destinationIndex
        ) {
          destinationIndex -= 1;
        }
        if (
          sourceGroup.title === destinationGroup.title &&
          (destinationIndex == null || sourceIndex === destinationIndex)
        ) {
          return;
        }

        if (sourceGroup.title === destinationGroup.title) {
          const sourceItems = [...sourceGroup.items];
          const [removed] = sourceItems.splice(sourceIndex, 1);
          if (destinationIndex === null) {
            destinationIndex = sourceItems.length;
          }
          sourceItems.splice(destinationIndex, 0, removed);

          setUserDashboard((groups) =>
            groups.map((group) =>
              group.title === sourceGroup.title
                ? { ...group, items: sourceItems }
                : group,
            ),
          );
        } else {
          const sourceItems = [...sourceGroup.items];
          const [removed] = sourceItems.splice(sourceIndex, 1);
          const destinationItems = [...destinationGroup.items];
          if (destinationIndex === null) {
            destinationIndex = destinationItems.length;
          }
          destinationItems.splice(destinationIndex, 0, removed);

          setUserDashboard((groups) =>
            groups.map((group) =>
              group.title === sourceGroup.title
                ? { ...group, items: sourceItems }
                : group.title === destinationGroup.title
                  ? { ...group, items: destinationItems }
                  : group,
            ),
          );
        }
      }
    }
  }, [setUserDashboard, userDashboard]);
}
