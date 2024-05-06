import { SvgIconComponent } from "@mui/icons-material";
import { ElementType } from "react";

export default interface ApplicationConfig {
  name: string;
  component: ElementType;
  icon: SvgIconComponent;
}
