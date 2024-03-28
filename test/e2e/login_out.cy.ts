/// <reference types="cypress" />

// Make sure the user can login and logout
describe("Login and Logout", () => {
  const baseUrl = Cypress.env("BASE_URL");

  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit(`https://${baseUrl}:8000`);
  });

  it("login", () => {
    // Find the login button on click on it
    cy.contains("Login").click();

    // Make sure we are on the /auth page
    cy.url().should("include", "/auth");

    // Continue with the default parameters
    cy.contains("Login through your Identity Provider").click();

    cy.url().should("include", `http://${baseUrl}:32002`);

    // The user is redirected to the OIDC provider login page and needs to login
    cy.origin(`http://${baseUrl}:32002`, () => {
      // Find the username and password fields and fill them
      cy.get("#login").type("admin@example.com");
      cy.get("#password").type("password");

      // Find the login button and click on it
      cy.get("button").click();
      // Grant access
      cy.get(":nth-child(1) > form > .dex-btn").click();
    });

    // The user is redirected back to the /auth page
    cy.url().should("include", "/auth");

    // From now on the user is logged in
    // The login buttton should not be present anymore
    cy.contains("Login").should("not.exist");
    cy.contains("Hello admin").should("exist");

    // Logout
    cy.get(".MuiAvatar-root").click();
    cy.contains("Logout").click();

    // The user is redirected back to the /auth page
    cy.url().should("include", "/auth");
  });
});
