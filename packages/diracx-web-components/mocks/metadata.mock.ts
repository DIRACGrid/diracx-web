import { fn } from "@storybook/test";
// @ts-ignore: Cannot find module '@actual/hooks/metadata'
import * as actual from "@actual/hooks/metadata";

export const useMetadata = fn(actual.useMetadata);
export type Metadata = actual.Metadata;
