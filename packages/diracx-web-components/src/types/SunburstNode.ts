import { HierarchyRectangularNode } from "d3-hierarchy";

import type { SunburstTree } from "./SunburstTree";

export interface SunburstNode extends HierarchyRectangularNode<SunburstTree> {
  /** The current node in the hierarchy */
  current?: SunburstNode;
}
