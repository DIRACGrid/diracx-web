"use client";

import { SvgIconComponent } from "@mui/icons-material";
import { InternalFilter } from "./Filter";

// Define the type for the Dashboard Item state
export interface DashboardItem {
  title: string;
  type: string;
  id: string;
  icon: SvgIconComponent | null;
  data?: InternalFilter[];
}
