export type SunburstTree = {
  /** The name of the node */
  name: string;
  /** The value of the node if it's a leaf */
  value?: number;
  /** The children of the node */
  children?: SunburstTree[];
};
