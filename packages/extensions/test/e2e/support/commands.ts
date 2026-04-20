/// <reference types="cypress" />

Cypress.Commands.add("login", () => {
  cy.session("login", () => {
    cy.visit("/auth");

    // Login
    cy.get('[data-testid="login-form-button"]').click();

    // Handle OIDC provider login (cross-origin)
    const domain = Cypress.config()
      .baseUrl?.replace("https://", "")
      .split(":")[0];

    cy.origin(`http://${domain}:32002`, () => {
      cy.get("#login").type("admin@example.com");
      cy.get("#password").type("password");
      cy.get("button").click();
      cy.get(":nth-child(1) > form > .dex-btn").click();
    });

    cy.url().should("include", "/auth");
  });
});

Cypress.Commands.add("visitApp", () => {
  cy.visit("/");
  // Wait for the authenticated dashboard to be fully rendered.
  // The permanent drawer is always present once OIDC initialization,
  // session validation, and React rendering are all complete.
  cy.get('[data-testid="drawer-permanent"]').should("exist");
});
