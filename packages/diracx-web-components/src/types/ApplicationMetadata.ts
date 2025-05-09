"use client";

import { SvgIconComponent } from "@mui/icons-material";
import { ElementType } from "react";

export default interface ApplicationMetadata {
  name: string;
  component: ElementType;
  icon: SvgIconComponent;
  /** Function used to get the state of the app for sharing */
  getState?: (name: string) => ApplicationState;
  /** Function used to set the state of the app after an import */
  setState?: (appId: string, state: ApplicationState) => void;
}

export type ApplicationState = string;
