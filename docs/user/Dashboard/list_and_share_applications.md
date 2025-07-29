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
   - :bulb: You can't use the same name for several intances

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

1. Click on the **Export** button at the top-right corner of the page.
2. Select the instances you want to share.
   - :bulb: You can select a group to select all instances within that group.
   - :bulb: For each instance, the shared content will include the name you gave it and the settings you configured.
3. Click on **Export N Selected**.
   - :bulb: A menu will appear with a text box containing the exported JSON.
4. Click on the **Copy to Clipboard** button.
5. Send this text to the person you want to share it with.
   - :bulb: If you're using **Mattermost**, you can wrap the text with triple backticks (```) to display it nicely.


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

**Good to know:** When switching to a new version, the settings you are trying to import may no longer be valid. In this case, a new window will appear, offering to resolve the issue by updating the state copied to your clipboard. This updated version preserves your imported rules as much as possible. 
