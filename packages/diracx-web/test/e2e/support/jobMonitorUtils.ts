/**
 * Set up the dashboard with two Job Monitor apps via sessionStorage.
 * Call this after cy.login() and before cy.visit("/").
 */
export function setupJobMonitorDashboard() {
  cy.window().then((win) => {
    win.sessionStorage.setItem(
      "savedDashboard",
      '[{"title":"Group 2","extended":true,"items":[{"title":"Job Monitor","id":"Job Monitor0","type":"Job Monitor"},{"title":"Job Monitor 2","id":"Job Monitor 21","type":"Job Monitor"}]}]',
    );
  });
}

/**
 * Submit jobs to the backend using the API.
 */
export function addJobs(numberOfJobs: number) {
  cy.window().then((win) => {
    const sessionData = win.sessionStorage.getItem(
      "oidc.vo:diracAdmin group:admin",
    );

    if (!sessionData) {
      throw new Error("Access token not found in session storage");
    }

    const accessToken = JSON.parse(sessionData).tokens.accessToken;

    Cypress._.times(numberOfJobs, () => {
      cy.request({
        method: "POST",
        url: "/api/jobs/jdl",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: ['Arguments = "jobDescription.xml -o LogLevel=INFO'],
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
}

/**
 * Ensure there are at least `minNumberOfJobs` in the table.
 * If not, add jobs and refresh. Call after the table is visible.
 */
export function ensureMinimumJobs(minNumberOfJobs: number) {
  cy.contains("Loading OIDC Configuration").should("not.exist");
  cy.contains("Loading").should("not.exist");
  cy.get('[data-testid="loading-skeleton"]').should("not.exist");

  cy.get("body").then(($body) => {
    if (
      $body.find('div:contains("No data or no results match your filters.")')
        .length > 0
    ) {
      cy.log("No data available, adding jobs");
      addJobs(minNumberOfJobs);
      // Wait for the jobs to be created on the backend
      cy.wait(2000);
    } else {
      cy.log("Data available, checking if enough jobs are present");
      cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
        const lastNumber = parseInt($pagination.text().split(" ").pop() || "0");

        if (lastNumber < minNumberOfJobs) {
          const numberOfJobsToAdd = minNumberOfJobs - lastNumber;
          addJobs(numberOfJobsToAdd);
        } else {
          cy.get("table").should("be.visible");
        }
      });
    }

    // Refresh the jobs
    cy.get('[data-testid="refresh-search-button"]').click();
  });
}
