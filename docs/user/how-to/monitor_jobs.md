# Job Monitor documentation

## The search bar

The search bar allows you to filter jobs based on various criteria. The filters are represented as equations in the search bar, where each equation consists of a job attribute, an operator, and a value.

!!! info "Automatic Search"
    A search is automatically performed when all the equations in the search bar are valid.

=== "Create a filter"

    1. Click on the search bar and start typing
    2. Suggestions will appear based on the available job attributes
    3. Select a suggestion to choose the criterion
    4. Type or select an operator and a value to filter by

    !!! tip "Smart Suggestions"
        The search bar only suggests attributes, operators, and values that are available in your current set of jobs.

=== "Edit a filter"

    - Click on the filter in the search bar to edit it
    - Change the operator or value by clicking on them
    - Use the arrow keys to navigate through the equations and edit them

=== "Remove a filter"

    - Press the ++backspace++ key to remove the last token
    - Right-click on the equation to remove the entire equation


## Use the table
By default, the jobs are displayed in a table. If you are viewing them in another chart, you can click the table button next to the search bar to switch back to the table view.

The table displays the jobs that match the criteria specified in the search bar. Each row represents a job, and the columns show various attributes of the job, such as its ID, status, type, and submission date.

=== "Table Management"

    **Column Selection**
    : Click on the :material-eye: icon to select more columns to display in the table.

    **Sorting**
    : Click on column headers to sort the table. First click sorts ascending, second click sorts descending.

    **Page Size**
    : Use the `Row per page` dropdown at the bottom of the table to control how many jobs are displayed per page.

=== "Job Actions"

    **View Job Details**
    : Right-click on a job to open the `Job History`.

    **Bulk Actions**
    : Select one or more jobs using the checkboxes, then use the action buttons:

    - **Get IDs**: Copy the IDs of selected jobs to clipboard
    - **Reschedule**: Reschedule the selected jobs
    - **Kill**: Kill the selected jobs  
    - **Delete**: Delete the selected jobs

    !!! warning "Destructive Actions"
        Be careful when using Kill or Delete actions as they cannot be undone.

## Use the Pie Chart
You can change the visualization to use a pie chart with the button next to the search bar. The pie chart provides a hierarchical view of the jobs based on their attributes. The `Columns to plot` component lets you choose your criteria for visualizing the jobs. The chart can display two levels, and you can then click on a section of the chart to zoom into that category and see more details.
