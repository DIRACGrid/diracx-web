"use client";

import { Filter } from "./Filter";

interface SortOption {
  parameter: string;
  direction: "asc" | "desc";
}

export interface SearchBody {
  search?: Filter[];
  sort?: SortOption[];
}
