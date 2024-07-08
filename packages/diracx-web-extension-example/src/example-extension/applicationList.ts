import { applicationList } from "@diracgrid/diracx-web-components/components";
import { ApplicationConfig } from "@diracgrid/diracx-web-components/types";
import { BugReport } from "@mui/icons-material";
import TestApp from "@/example-extension/components/applications/testApp";

const appList: ApplicationConfig[] = [
  ...applicationList,
  { name: "Test App", component: TestApp, icon: BugReport },
];

export { appList as applicationList };
export default appList;
