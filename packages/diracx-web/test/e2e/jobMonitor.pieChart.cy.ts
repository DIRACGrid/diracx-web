/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Pie Chart", () => {
  beforeEach(() => {
    cy.login();

    cy.visit("/");
    setupJobMonitorDashboard();

    cy.contains("Job Monitor").click();

    ensureMinimumJobs(55);
  });

  it("should render the pie chart alongside the table", () => {
    // Both table and pie chart should be visible (no toggle needed)
    cy.get("table").should("be.visible");
    cy.get('[data-testid="job-pie-chart"]').should("be.visible");
    cy.get('[data-testid="group-selector"]').should("be.visible");
  });

  it("should add a filter when clicking a pie chart slice", () => {
    // Ensure pie chart is rendered with slices
    cy.get('[data-testid="job-pie-chart"]')
      .find(".MuiPieArc-root")
      .should("have.length.greaterThan", 0);

    // Record the number of rows before clicking
    cy.get(".MuiTablePagination-displayedRows")
      .invoke("text")
      .then((textBefore) => {
        const totalBefore = parseInt(textBefore.split("of")[1].trim(), 10);

        // Click the first pie slice
        cy.get('[data-testid="job-pie-chart"]')
          .find(".MuiPieArc-root.MuiPieArc-data-index-0")
          .click({ force: true });

        // A filter chip should appear in the search bar
        cy.get('[data-testid="search-bar"]')
          .find(".MuiChip-root")
          .should("have.length", 3);

        // The total number of jobs should be less than or equal to before
        cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
          const totalAfter = parseInt(
            $pagination.text().split("of")[1].trim(),
            10,
          );
          expect(totalAfter).to.be.at.most(totalBefore);
        });
      });
  });

  it("should update the pie chart when changing the group-by column", () => {
    // The default group is "Status", switch to "Site"
    cy.get('[data-testid="group-selector"]').contains("Site").click();

    // The pie chart should still render with slices
    cy.get('[data-testid="job-pie-chart"]')
      .find(".MuiPieArc-root")
      .should("have.length.greaterThan", 0);

    // Click a slice to verify the filter uses the new group column
    cy.get('[data-testid="job-pie-chart"]')
      .find(".MuiPieArc-root.MuiPieArc-data-index-0")
      .click({ force: true });

    // A filter chip should appear with the Site column
    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .first()
      .should("contain.text", "Site");
  });
});
