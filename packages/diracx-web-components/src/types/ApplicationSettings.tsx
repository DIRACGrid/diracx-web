import type { ApplicationState } from "./ApplicationMetadata";

export type ApplicationSettings = {
  appType: string;
  appName: string;
  state: ApplicationState;
};
