import { DashboardItem } from "./DashboardItem";

// Define the type for the Dashboard Group state
export interface DashboardGroup {
  title: string;
  extended: boolean;
  items: DashboardItem[];
}
