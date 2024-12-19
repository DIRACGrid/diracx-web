/// <reference types="cypress" />

describe("Job Monitor", () => {
  beforeEach(() => {
    cy.session("login", () => {
      cy.visit("/");
      //login
      cy.get('[data-testid="button-login"]').click();
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
      "/?appId=OwnerMonitor1&dashboard=%5B3Gubbins+Apps%27~extended%21true~items%21%5B-020.04~data%21%5B%5D%29%2C3Job2Job.Job4%29%5D%29%5D*Monitor-%28%27title%21%27.*1%27~type%21%270Owner2s%27~id%21%273-My+4+*%27%014320.-*_",
    );
  });

  it("should render the drawer", () => {
    cy.get("header").contains("Owner Monitor").should("be.visible");
  });

  /** Input field interactions */

  it("adds a new owner and verifies it in the table", () => {
    // Type the new owner name
    cy.get('[data-testid="owner-name-input"]').type("Josephine");

    // Click the Add Owner button
    cy.contains("button", "Add Owner").click();

    cy.get('[data-testid="virtuoso-scroller"]')
      .wait(100) // Wait for rendering
      .scrollTo("bottom", { ensureScrollable: false });

    // Assert the table contains the new owner
    cy.get("table tbody tr:last-child td:last-child").should(
      "contain.text",
      "Josephine",
    );
  });

  /** Column interactions */

  it("should hide/show columns", () => {
    // Click on the visibility icon
    cy.get('[data-testid="VisibilityIcon"] > path').click();
    cy.get('[data-testid="column-visibility-popover"]').should("be.visible");

    // Hide the "Owner Name" column
    cy.get('[data-testid="column-visibility-popover"]').within(() => {
      cy.contains("Owner Name").parent().find('input[type="checkbox"]').click();
    });

    // Close the popover by clicking outside
    cy.get("body").click(0, 0);
    cy.get('[data-testid="column-visibility-popover"]').should("not.exist");

    // Loop over the table column and make sure that "VO" is present
    cy.get("table thead tr th").each(($th) => {
      if ($th.text() === "Owner Name") {
        expect($th).to.exist;
      }
    });
  });
});
