import { UserDocumentation } from "../types/UserDocumentation";

/**
 * User documentation for DiracX web.
 *
 */
export const userDocumentation: UserDocumentation = {
  generalUsage: `
# General usage 

## Navigate between applications  

You can click on the \`Add application\` button to create a new instance of an application. The list of open instances appears in the sidebar on the left. Clicking on one of these instances will display it in the center of the dashboard

## Share applications

To share applications, click the \`Export\` button at the top right of the screen. Then, select the applications you want to share and copy them to the clipboard.

## Import applications

To import applications, click the \`Import\` button at the top right of the screen. Paste the copied applications into the input field and click \`Import\`. The imported applications will appear in the sidebar.
If the states are outdated, you can copy the updated version of them by clicking the \`Copy all updated states\` button. 

##  Save you dashoard
To save your dashboard, clicke the \`Export\`button at the top right of the screen. Then, select the applications you want to save and click on the \`Save in the browser\` button. The saved applications will be stored in your browser's local storage.
When you want to load the saved applications, click the \`Import\` button at the top right of the screen and select the \`Load from the browser\` option. The saved applications will be loaded into the sidebar.

`,
  applications: [
    {
      appName: "Job Monitor",
      sections: [
        {
          title: "General Usage",
          content: `
# General Usage

The \`Job Monitor\` application allows you to track and manage jobs. It provides a search bar to filter jobs by criteria such as job type, status, and submission date. The application displays a list of jobs in a table format, with each job showing its status and other relevant information.`,
        },
        {
          title: "The Search Bar",
          content: `
# How to use the search bar

The search bar allows you to filter jobs based on various criteria. The filters are represented as equations in the search bar, where each equation consists of a job attribute, an operator, and a value. 

A resarch is automatically performed when all the equations in the search bar are valid. 

## How to create a filter
To create a filter, click on the search bar and start typing. Suggestions will appear based on the available job attributes. You can select a suggestion to choose the criterion. After that, you can either type or select an operator and a value to filter by.

The search bar only suggests attributes, operators, and values that are available in your current set of jobs.

## How to edit a filter
To edit a filter, click on the filter in the search bar. You can change the operator or value by clicking on them. You can also use the arrow keys to navigate through the equations and edit them. 

## How to remove a filter

To remove a filter, you can either press the \`Backspace\` key to remove the last token or right-click on the equation to remove the entire equation. `,
        },
        {
          title: "The table",
          content: `
# How to use the table

The table displays the jobs that match the criteria specified in the search bar. Each row represents a job, and the columns show various attributes of the job, such as its ID, status, type, and submission date.

## Actions on the table

You can click on the eye icon to select more columns to display in the table. 
You can sort the table by clicking on the column headers. Clicking on a column header will sort the table in ascending order, and clicking again will sort it in descending order.
You can set the page size by clicking on the \`Row per page\` dropdown at the bottom of the table. This allows you to control how many jobs are displayed per page.

## Actions on a job

You can do a right-click on a job to open the \`Job History\`.
You can select one or more jobs by clicking on the checkboxes next to each job. Once you have selected jobs, you can perform actions on them using the buttons at the top of the table. The available actions include:
- **Get IDs**: This button will copy the IDs of the selected jobs to the clipboard.
- **Rechedule**: This button will reschedule the selected jobs.
- **Kill**: This button will kill the selected jobs.
- **Delete**: This button will delete the selected jobs.`,
        },
      ],
    },
  ],
};
