import { fn } from "@storybook/test";
// Aliased '@/hooks/metadata' as '@actual/hooks/metadata' in the Storybook config to prevent the mock from importing itself.
// @ts-ignore: Cannot find module '@actual/hooks/metadata'
import * as actual from "@actual/hooks/metadata";

export const useMetadata = fn(actual.useMetadata);
export type Metadata = actual.Metadata;
