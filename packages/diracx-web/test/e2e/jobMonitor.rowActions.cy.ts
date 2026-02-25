/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Row Actions", () => {
  beforeEach(() => {
    cy.login();

    cy.visit("/");
    setupJobMonitorDashboard();

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

  // ### FIXME: The reschedule functionality is not working as expected ###
  // The test below would be decommented once the reschedule functionality is fixed in diracx

  // it("should reschedule jobs", () => {
  //   cy.get("[data-testid=search-field]").type("Reschedule Counter{enter}!={enter}3{enter}");

  //   // Create aliases for the job items
  //   cy.get("table tbody [data-index=0]").as("jobItem1");
  //   cy.get("table tbody [data-index=1]").as("jobItem2");
  //   cy.get("table tbody [data-index=2]").as("jobItem3");

  //   // First, kill the jobs to ensure they can be rescheduled
  //   cy.get("@jobItem1").click({ force: true });
  //   cy.get("@jobItem2").click({ force: true });
  //   cy.get("@jobItem3").click({ force: true });

  //   cy.get('[data-testid="kill-jobs-button"] > path').click();

  //   // Then, select the jobs to reschedule
  //   cy.get("@jobItem1").click({ force: true });
  //   cy.get("@jobItem2").click({ force: true });
  //   cy.get("@jobItem3").click({ force: true });

  //   cy.get('[data-testid="ReplayIcon"] > path').click({ force: true });
  //   cy.get('[aria-label="Reschedule"]').click({ force: true });
  //   cy.get('[data-testid="ReplayIcon"] > path').click({ force: true });
  //   cy.get('[aria-label="Reschedule"]').click({ force: true });

  //   // Make sure the job status is "Received"
  //   cy.get("table tbody [data-index=0]").find("td").eq(2).should("contain", "Received");
  //   cy.get("table tbody [data-index=1]").find("td").eq(2).should("contain", "Received");
  //   cy.get("table tbody [data-index=2]").find("td").eq(2).should("contain", "Received");
  // });
});
