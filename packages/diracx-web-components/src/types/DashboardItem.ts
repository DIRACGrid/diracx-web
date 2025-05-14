"use client";

import { InternalFilter } from "./Filter";

// Define the type for the Dashboard Item state
export interface DashboardItem {
  title: string;
  type: string;
  id: string;
  data?: InternalFilter[];
}
