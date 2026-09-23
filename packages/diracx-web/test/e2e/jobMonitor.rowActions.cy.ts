/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
  forceJobsStatus,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Row Actions", () => {
  beforeEach(() => {
    cy.login();
    setupJobMonitorDashboard();
    cy.visitApp();

    cy.contains("Job Monitor").click();

    ensureMinimumJobs(55);
  });

  it("should display job history dialog", () => {
    cy.get("table tbody tr").first().find("td").eq(3).rightclick();

    // A context menu should appear
    cy.contains("Get history").should("be.visible");
    cy.contains("Get history").click();

    // A dialog should appear
    cy.contains("Job History:").should("be.visible");
  });

  it("should kill jobs", () => {
    // "Done" jobs cannot be killed: move the first three jobs back to "Running"
    const jobIds: number[] = [];
    [0, 1, 2].forEach((index) => {
      cy.get(`table tbody [data-index=${index}]`)
        .find("td")
        .eq(1)
        .invoke("text")
        .then((text) => jobIds.push(Number(text.trim())));
    });
    cy.then(() => forceJobsStatus(jobIds, "Running"));
    cy.get('[data-testid="refresh-search-button"]').click();
    cy.get("table tbody [data-index=2]")
      .find("td")
      .eq(2)
      .should("contain", "Running");

    cy.get("table tbody [data-index=0]").click({ force: true });
    cy.get("table tbody [data-index=1]").click({ force: true });
    cy.get("table tbody [data-index=2]").click({ force: true });

    cy.get('[data-testid="kill-jobs-button"]').first().click();

    // Make sure the job status is "Killed"
    cy.get("table tbody [data-index=0]")
      .find("td")
      .eq(2)
      .should("contain", "Killed");
    cy.get("table tbody [data-index=1]")
      .find("td")
      .eq(2)
      .should("contain.text", "Killed");
    cy.get("table tbody [data-index=2]")
      .find("td")
      .eq(2)
      .should("contain.text", "Killed");
  });

  it("should delete jobs", () => {
    cy.get("table tbody [data-index=0]").as("jobItem1");
    cy.get("table tbody [data-index=1]").as("jobItem2");
    cy.get("table tbody [data-index=2]").as("jobItem3");
    cy.get("@jobItem1").click({ force: true });
    cy.get("@jobItem2").click({ force: true });
    cy.get("@jobItem3").click({ force: true });

    cy.get('[data-testid="delete-jobs-button"]').first().click();

    // Make sure the jobs disappeared from the table
    cy.get("table").should("be.visible");
    cy.get("@jobItem1").find("td").eq(2).should("contain", "Deleted");
    cy.get("@jobItem2").find("td").eq(2).should("contain", "Deleted");
    cy.get("@jobItem3").find("td").eq(2).should("contain", "Deleted");
  });
});
