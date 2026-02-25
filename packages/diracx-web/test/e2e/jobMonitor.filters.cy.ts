/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Filters", () => {
  beforeEach(() => {
    cy.login();

    cy.visit("/");
    setupJobMonitorDashboard();

    cy.contains("Job Monitor").click();

    ensureMinimumJobs(55);
  });

  it("should handle filter addition", () => {
    cy.get("table").should("be.visible");
    cy.get("[data-testid=search-bar]");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);
  });

  it("should handle filter editing", () => {
    cy.get("table").should("be.visible");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get("[data-testid=search-field]").type("{leftArrow}2{enter}");
    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .contains("12")
      .should("exist");
  });

  it("should handle filter clear", () => {
    cy.get("table").should("be.visible");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);

    cy.get('[data-testid="clear-filters-button"]').click();

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 0);
  });

  it("should handle filter apply and persist", () => {
    cy.get("table").should("be.visible");

    let jobID: string;
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        jobID = text.trim();

        cy.get("[data-testid=search-field]").type(
          `ID{enter}={enter}${jobID}{enter}`,
        );
      });
    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);
    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .contains("ID")
      .should("exist");

    cy.get("table tbody tr").should("have.length", 1);
  });

  it("should handle filter apply and save filters in dashboard", () => {
    cy.get("table").should("be.visible");

    let jobID: string;
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        jobID = text.trim();

        cy.get("[data-testid=search-field]").type(
          `ID{enter}={enter}${jobID}{enter}`,
        );
      });

    // Wait for the filter to apply and state to be saved
    cy.wait(1000);

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);

    cy.get(".MuiButtonBase-root").contains("Job Monitor 2").click();

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 0);

    cy.get(".MuiButtonBase-root").contains("Job Monitor").click();

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);
  });

  it("should control the in the last operator utilization", () => {
    cy.get("table").should("be.visible");
    cy.get("[data-testid=search-field]").type(
      "Submission Time{enter}in the last{enter}4206942 years{enter}",
    );

    cy.get('[data-testid="search-bar"]')
      .find(".MuiChip-root")
      .should("have.length", 3);

    cy.get("table").should("be.visible");
  });
});
