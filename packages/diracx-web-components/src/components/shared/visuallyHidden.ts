import type { CSSProperties } from "react";

/**
 * Style for elements that should be hidden visually but remain
 * accessible to screen readers (e.g. aria-live announcements).
 *
 * Hoisted into a shared module so it is not rebuilt on every render.
 */
export const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};
