/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  addJobWithOutputSandbox,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Sandbox Download", () => {
  beforeEach(() => {
    cy.login();
    setupJobMonitorDashboard();
    cy.visitApp();
    cy.contains("Job Monitor").click();

    // Wait for the table to be ready
    cy.get('[data-testid="loading-skeleton"]').should("not.exist");
  });

  it("should download output sandbox", () => {
    addJobWithOutputSandbox().then((jobId) => {
      // Refresh to see the new job
      cy.get('[data-testid="refresh-search-button"]').click();
      cy.get('[data-testid="loading-skeleton"]').should("not.exist");

      // Find the job row by its ID and right-click to open context menu
      cy.contains("table tbody td", String(jobId)).rightclick();

      // Click download output sandbox from context menu
      cy.get('[data-testid="download-output-sandbox-button"]')
        .should("be.visible")
        .click();

      // Verify the success snackbar appears
      cy.contains(`Downloading output sandbox of ${jobId}`).should(
        "be.visible",
      );
    });
  });
});
