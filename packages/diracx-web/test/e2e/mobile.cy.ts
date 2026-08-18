/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

/**
 * Asserts that the page has no horizontal overflow.
 * If document.scrollWidth exceeds the viewport width, content is
 * escaping its container — exactly the kind of regression this
 * test is meant to catch.
 */
function assertNoHorizontalOverflow() {
  cy.document().then((doc) => {
    const scrollWidth = doc.documentElement.scrollWidth;
    const clientWidth = doc.documentElement.clientWidth;
    expect(scrollWidth).to.be.at.most(
      clientWidth,
      `Page content (${scrollWidth}px) should not exceed viewport width (${clientWidth}px)`,
    );
  });
}

describe("Mobile Viewport — no horizontal overflow", () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.login();
    cy.visit("/");
    setupJobMonitorDashboard();
  });

  it("Job Monitor table and pie chart fit within the viewport", () => {
    cy.contains("Job Monitor").click();
    ensureMinimumJobs(5);

    // Wait for both table and pie chart to render
    cy.get("table").should("be.visible");
    cy.get('[data-testid="job-pie-chart"]').should("be.visible");

    assertNoHorizontalOverflow();
  });

  it("Job Monitor with filters applied fits within the viewport", () => {
    cy.contains("Job Monitor").click();
    ensureMinimumJobs(5);

    cy.get("table").should("be.visible");

    // Add a filter via the pie chart (click the first slice)
    cy.get('[data-testid="job-pie-chart"]')
      .find(".MuiPieArc-root")
      .first()
      .click({ force: true });

    // Wait for filter chip to appear
    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length.greaterThan", 0);

    assertNoHorizontalOverflow();
  });
});
