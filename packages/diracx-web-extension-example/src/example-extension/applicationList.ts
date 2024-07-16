import { applicationList } from "@dirac-grid/test-lib/components";
import { ApplicationConfig } from "@dirac-grid/test-lib/types";
import { BugReport } from "@mui/icons-material";
import TestApp from "@/example-extension/components/applications/testApp";

const appList: ApplicationConfig[] = [
  ...applicationList,
  { name: "Test App", component: TestApp, icon: BugReport },
];

export { appList as applicationList };
export default appList;
