"use client";

import { SvgIconComponent } from "@mui/icons-material";
import { ElementType } from "react";

export default interface ApplicationMetadata {
  name: string;
  component: ElementType;
  icon: SvgIconComponent;
  validateAndConvertState?: (
    state: ApplicationState,
  ) => [ApplicationState, boolean];
}

export type ApplicationState = string;
