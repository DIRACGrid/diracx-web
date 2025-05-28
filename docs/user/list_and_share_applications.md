# Managing Application Instances

An *application instance* is a graphical web interface that allows users to interact with DiracX services. DiracX-Web is essentially a collection of such applications, and users can "spawn" instances to interact with them.

By default, a few application instances are displayed (e.g., `My Jobs`, an instance of `Job Monitor`). This guide will help you manage, organize, and share application instances effectively.

## Basics

### Accessing More Applications

1. Click the **Add Application** button at the bottom of the sidebar.
   - :bulb: On mobile devices, first open the sidebar by clicking the **menu icon** (☰) at the top-left corner.
2. Select an application from the list in the dialog box.
   - :bulb: The selected application will appear in the sidebar.

### Opening Multiple Instances of the Same Application

- Repeat the steps above to open additional instances of the same application.
  - :bulb: Each instance has its own state, making it ideal for monitoring different job groups with specific criteria for instance.

### Renaming an Application Instance

1. **Right-click** on the instance name in the sidebar.
   - :bulb: A context menu will appear.
2. Select **Rename**.
   - :bulb: The instance name will change to an input field.
3. Enter a new name and press **Enter** to save it.

### Moving an Application Instance

1. Locate the **handle icon** next to the instance name.
2. Click and hold the handle to select the instance.
3. Drag it to the desired position within the sidebar.
4. Release the mouse button to place the instance.

### Deleting an Application Instance

1. **Right-click** on the instance name in the sidebar.
   - :bulb: A context menu will appear.
2. Select **Delete**.
   - :bulb: The application instance will disappear from the sidebar.

### Sharing Your Dashboard

1. Copy the URL from your browser.
   - :bulb: The URL encodes the current state of your dashboard.
2. Share it with others.
   - :warning: The recipient will see a similar dashboard layout but may not see identical content if:
     - They belong to a different VO or group.
     - Time-sensitive data has changed since sharing.
   - :warning: Encoding too many application instances may create discrepancies as the URL has a theoretical limit of 8000 characters based on [RFC9110](https://www.rfc-editor.org/rfc/rfc9110#section-4.1-5) 

## Advanced Features

When managing multiple instances of the same application, grouping can help you organize your dashboard efficiently.

### Creating a New Group

1. **Right-click** anywhere in the sidebar.
   - :bulb: A context menu will appear.
2. Select **New Group**.
   - :bulb: A new group with a default name will appear in the sidebar.
3. Add new application instances to the group using the **Add Application** button.
   - :bulb: By default, new instances will be placed in the most recently created group.

### Renaming a Group

1. **Right-click** on the group name in the sidebar.
   - :bulb: A context menu will appear.
2. Select **Rename**.
   - :bulb: The group name will change to an input field.
3. Enter a new name and press **Enter** to save it.

### Moving a Group

1. Locate the **handle icon** next to the group name.
2. Click and hold the handle to select the group.
3. Drag the group to the desired position within the sidebar.
   - :bulb: All application instances within the group will move together.
4. Release the mouse button to place the group.

### Moving Instances Between Groups

1. Drag an application instance from one group.
2. Drop it into another group using the same drag-and-drop process as moving instances within a group.

### Deleting a Group

1. **Right-click** on the group name in the sidebar.
   - :bulb: A context menu will appear.
2. Select **Delete**.
   - :bulb: The group and all its application instances will disappear from the sidebar.


### Share and import the settings of an application

1. **Share**: You can export the status of an app by clicking on the share button in the top-right corner of the screen. After clicking, you can select which group and app you want to share and then copy a text corresponding to the states of the selected applications.

2. **Import**: Next to the export button you can find the import button. You can paste into the window opened by the button the text corresponding to one or multiple shared apps. This will create a new group named *Imported App* with the imported applications and their settings. 

**Good to know:** When switching to a new version, the settings you are trying to import may no longer be valid. In this case, a new window will appear, offering to resolve the issue by updating the state copied to your clipboard. This updated version preserves your imported rules as much as possible. 
