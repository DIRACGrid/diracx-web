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
        const sourceTitle = sourceData.title as string;
        const destinationTitle = targetData.title as string;
        const sourceIndex = sourceData.index as number;

        if (location.current.dropTargets.length === 2) {
          const closestEdgeOfTarget = extractClosestEdge(targetData);
          const targetIndex = targetData.index as number;
          const destinationIndex = (
            closestEdgeOfTarget === "top" ? targetIndex : targetIndex + 1
          ) as number;

          reorderSections(
            sourceTitle,
            destinationTitle,
            sourceIndex,
            destinationIndex,
          );
        } else {
          reorderSections(sourceTitle, destinationTitle, sourceIndex);
        }
      },
    });

    // The groups are looked up inside the functional updater, so it always
    // sees the freshest state — no ref mirror, no re-subscription on every
    // dashboard change, and no window where a drop reads a stale dashboard.
    function reorderSections(
      sourceTitle: string,
      destinationTitle: string,
      sourceIndex: number,
      destinationIndex: number | null = null,
    ) {
      setUserDashboard((groups) => {
        const sourceGroup = groups.find((group) => group.title === sourceTitle);
        const destinationGroup = groups.find(
          (group) => group.title === destinationTitle,
        );
        if (!sourceGroup || !destinationGroup) return groups;

        const sameGroup = sourceGroup.title === destinationGroup.title;
        // Copy into a local so the updater stays pure (React StrictMode may
        // invoke it twice in development).
        let destIndex = destinationIndex;
        if (sameGroup && destIndex && sourceIndex < destIndex) {
          destIndex -= 1;
        }
        if (sameGroup && (destIndex === null || sourceIndex === destIndex)) {
          return groups; // Nothing to do
        }

        if (sameGroup) {
          const sourceItems = [...sourceGroup.items];
          const [removed] = sourceItems.splice(sourceIndex, 1);
          if (destIndex === null) {
            destIndex = sourceItems.length;
          }
          sourceItems.splice(destIndex, 0, removed);
          return groups.map((group) =>
            group.title === sourceGroup.title
              ? { ...group, items: sourceItems }
              : group,
          );
        }

        const sourceItems = [...sourceGroup.items];
        const [removed] = sourceItems.splice(sourceIndex, 1);
        const destinationItems = [...destinationGroup.items];
        if (destIndex === null) {
          destIndex = destinationItems.length;
        }
        destinationItems.splice(destIndex, 0, removed);
        return groups.map((group) =>
          group.title === sourceGroup.title
            ? { ...group, items: sourceItems }
            : group.title === destinationGroup.title
              ? { ...group, items: destinationItems }
              : group,
        );
      });
    }
  }, [setUserDashboard]);
}
