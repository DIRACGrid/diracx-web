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

    - Press the `Backspace` key to remove the last token
    - Right-click on the equation to remove the entire equation


## Use the table

The table displays the jobs that match the criteria specified in the search bar. Each row represents a job, and the columns show various attributes of the job, such as its ID, status, type, and submission date.

=== "Table Management"

    **Column Selection**
    : Click on the eye icon to select more columns to display in the table.

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

A pie chart is displayed alongside the table, showing the distribution of jobs grouped by a selected attribute. The total number of jobs is shown in the center of the donut chart.

=== "Group by attribute"

    Use the toggle buttons above the chart to switch between different grouping attributes (e.g., Status, Site, Minor Status). Only attributes that are not quasi-unique (like Job ID or dates) are available for grouping.

=== "Filter by clicking"

    Click on a slice of the pie chart to add a filter to the search bar. Both the table and the pie chart will update to reflect the new filter.
