/// <reference types="cypress" />

describe("Job Monitor", () => {
  beforeEach(() => {
    cy.session("login", () => {
      cy.visit("/");
      //login
      cy.contains("Login through your Identity Provider").click();
      cy.get("#login").type("admin@example.com");
      cy.get("#password").type("password");

      // Find the login button and click on it
      cy.get("button").click();
      // Grant access
      cy.get(":nth-child(1) > form > .dex-btn").click();
      cy.url().should("include", "/auth");
    });

    // Visit the page where the Job Monitor is rendered
    cy.visit(
      "/?appId=JobMonitor0&sections=6%21%27Test+Group%27~extended%21true~items%216*.~id430%27%29%2C-5%27~id51.%29%5D%29%5D*4+3-%28%27title.%27~type*%273Monitor4%21%27Job5*+26%5B-%016543.-*_",
    );
  });

  it("should render the drawer", () => {
    cy.get("header").contains("Job Monitor").should("be.visible");
  });

  it("should handle filter addition", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");
  });

  it("should handle filter deletion", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get('[data-testid="CancelIcon"]').click();
    cy.get(".MuiChip-label").should("not.exist");
  });

  it("should handle filter editing", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get(".MuiChip-label").click();
    cy.get("#value").clear().type("test2");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").contains("test2").should("be.visible");
  });

  it("should handle filter clear", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Add filter").click();
    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test2");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Clear all").click();

    cy.get(".MuiChip-label").should("not.exist");
  });

  it("should handle filter apply and persist", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Apply").click();
    cy.wait(1000);
    cy.reload();

    cy.get(".MuiChip-label").should("be.visible");
  });

  it("should handle filter apply and save filters in dashboard", () => {
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-column"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get(
      ".css-1x33toh-MuiStack-root > .MuiStack-root > .MuiButtonBase-root",
    ).click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Apply").click();
    cy.wait(1000);
    cy.get(".MuiButtonBase-root").contains("Job Monitor 2").click();

    cy.get(".MuiChip-label").should("not.exist");

    cy.get(".MuiButtonBase-root").contains("Job Monitor").click();
    cy.get(".MuiChip-label").should("be.visible");
  });
});
