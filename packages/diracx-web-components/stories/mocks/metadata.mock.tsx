import { fn } from "@storybook/test";
import * as actual from "../../src/hooks/metadata";

export const useMetadata = fn(actual.useMetadata);
export type Metadata = actual.Metadata;
