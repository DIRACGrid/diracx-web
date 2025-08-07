import { SunburstNode } from "../../../types";

/**
 * Gives the complete path to a node
 *
 * @param p The target node
 * @returns The path
 */
export function getPath(p: SunburstNode): string[] {
  const path = [p.data.name];
  let elt: SunburstNode = p;
  while (elt.depth > 0) {
    elt = elt.parent!;
    if (elt.data.name !== "") path.push(elt.data.name);
  }
  return path.reverse();
}

/**
 * Converts a size in Bytes to a human-readable format
 *
 * @param size The size in Bytes
 * @param total The total size (optional) to calculate the percentage
 * @returns A string with the size in a human-readable format
 */
export function sizeToText(size: number, total?: number): string {
  if (size >= 1e18)
    return (
      (size / 1e18).toFixed(2) +
      " EB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size >= 1e15)
    return (
      (size / 1e15).toFixed(2) +
      " PB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size >= 1e12)
    return (
      (size / 1e12).toFixed(2) +
      " TB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size >= 1e9)
    return (
      (size / 1e9).toFixed(2) +
      " GB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size >= 1e6)
    return (
      (size / 1e6).toFixed(2) +
      " MB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size >= 1e3)
    return (
      (size / 1e3).toFixed(2) +
      " KB" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  if (size < 1e3 && size >= 0)
    return (
      size.toFixed(2) +
      "B" +
      (total ? ` (${((size / total) * 100).toFixed(2)}%)` : "")
    );
  return "none";
}
