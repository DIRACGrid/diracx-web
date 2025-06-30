import { applicationList } from "@dirac-grid/diracx-web-components/components";
import { ApplicationMetadata } from "@dirac-grid/diracx-web-components/types";
import ElectricScooterIcon from "@mui/icons-material/ElectricScooter";
import OwnerMonitor from "@/gubbins/components/OwnerMonitor/OwnerMonitor";

// New Application List with the default ones + the Owner Monitor
const appList: ApplicationMetadata[] = [
  ...applicationList,
  { name: "Owner Monitor", component: OwnerMonitor, icon: ElectricScooterIcon },
];

export { appList as applicationList };
export default appList;
