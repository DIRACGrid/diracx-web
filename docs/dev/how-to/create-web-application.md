# Create an application

## In DiracX-Web

The applicatins created here will be available for DiracX-Web and for all the extensions.

### Declare the application

In the file `packages/diracx-web-components/src/components/applicationList.ts` you can extend the `applicationList` with your new app. 

You must provide: 
- A clear and explicit name
- The component representing the new app 
- An icon that will appear in the `Add application` menu
- An optional function, `validateAndConvertState`, which identifies and corrects the structure of a JSON pasted by the user during import. This function ensures compatibility between versions by transforming the pasted state into a valid, updated version. It should be reviewed and updated in any version that modifies the exported/imported state structure

!!! tip
    You can look at the type `ApplicationMetadata` for more details.

### Code the application

The code of your app should be in `packages/diracx-web-components/src/components/<new-app>`. The new app can and should use what already exist in `@dirac-grid/diracx-web-components`. 

In order to be compatible with the share and import buttons, the application must write its state to the session storage at `<appId>_State`. This slot is read from and written to by the corresponding functions.

!!! tip
    You can look at `JobMonitor` as an example.
