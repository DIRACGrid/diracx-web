import { SvgIconComponent } from "@mui/icons-material";

// Define the type for the userSections state
export type UserSection = {
  title: string;
  extended: boolean;
  items: {
    title: string;
    type: string;
    id: string;
    icon: SvgIconComponent;
    data?: any;
  }[];
};
