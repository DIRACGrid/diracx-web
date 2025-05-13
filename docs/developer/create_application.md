# Create an application

## In DiracX-Web

The applicatins created here will be available for DiracX-Web and for all the extensions.

### Declare the application

In the file `packages/diracx-web-components/src/components/ApplicationList.ts` you can extend the `applicationList` with your new app. You must provide a name (explicit), the component representing the new app and an icon that will appear in the `Add application` menu. You can also give two functions, `setState` and `getState`, to configure the export and import of your app.

### Code the application

The code of your app should be in `packages/diracx-web-components/src/components/<new-app>`. The new app can and should use what already exist in `@dirac-grid/diracx-web-components`. 

In order to be compatible with the share and import buttons, the application must write its state to the session storage at `<appId>_State`. This slot is read from and written to by the corresponding functions.

💡You can look at `JobMonitor` as an example.