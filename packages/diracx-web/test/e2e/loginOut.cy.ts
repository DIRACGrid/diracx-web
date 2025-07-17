/// <reference types="cypress" />

// Make sure the user can login and logout
describe("Login and Logout", () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit("/");
  });

  it("login", () => {
    // The user is redirected to the /auth page because not authenticated
    // Make sure we are on the /auth page
    cy.url().should("include", "/auth");

    // Continue with the default parameters
    cy.get('[data-testid="button-login"]').click();

    // Extract name from baseUrl (remove http:// and port number)
    const domain = Cypress.config()
      .baseUrl?.replace("https://", "")
      .split(":")[0];

    cy.url().should("include", `http://${domain}:32002`);

    // The user is redirected to the OIDC provider login page and needs to login
    cy.origin(`http://${domain}:32002`, () => {
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
    cy.get('[data-testid="button-login"]').should("not.exist");
    cy.contains("My Jobs").should("exist");

    // Click on the user avatar
    cy.get(".MuiAvatar-root").click();
    // Check the user details
    cy.contains("admin").should("exist");
    cy.contains("diracAdmin").should("exist");
    // Check the Properties accordion
    cy.contains("Properties").click();
    cy.contains("NormalUser").should("exist");

    // Logout
    cy.contains("Logout").click();

    // The user is redirected back to the /auth page
    cy.url().should("include", "/auth");

    // The user is logged out
    // The login button should be present
    cy.get('[data-testid="button-login"]').should("exist");

    // The user tries to access the dashboard page without being connected
    // The user is redirected to the /auth page
    cy.visit("/");
    cy.url().should("include", "/auth");
  });

  it("prevent infinite login loop", () => {
    // The user is redirected to the /auth page because not authenticated
    // Make sure we are on the /auth page
    cy.url().should("include", "/auth");

    const currentUrl = cy.url();

    cy.wait(5000); // Wait 5 seconds to let a possible infinite loop happen

    // Check that the URL has not changed
    cy.url().should("eq", currentUrl);

    // Login
    cy.get('[data-testid="button-login"]').click();
    cy.get("#login").type("admin@example.com");
    cy.get("#password").type("password");

    // Find the login button and click on it
    cy.get("button").click();
    // Grant access
    cy.get(":nth-child(1) > form > .dex-btn").click();
    cy.url().should("include", "/auth");

    // The user is redirected to the dashboard page
    cy.url().should("eq", Cypress.config().baseUrl);
  });
});
