import { applicationList } from "@dirac-grid/diracx-web-components/components";
import { ApplicationMetadata } from "@dirac-grid/diracx-web-components/types";
import { BugReport } from "@mui/icons-material";
import TestApp from "@/gubbins/components/TestApp/testApp";

// New Application List with the default ones + the Test app
const appList: ApplicationMetadata[] = [
  ...applicationList,
  { name: "Test App", component: TestApp, icon: BugReport },
];

export { appList as applicationList };
export default appList;
