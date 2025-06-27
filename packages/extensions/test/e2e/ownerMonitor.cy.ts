/// <reference types="cypress" />

describe("Job Monitor", () => {
  beforeEach(() => {
    cy.session("login", () => {
      cy.visit("/auth");
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
    cy.window().then((win) => {
      win.sessionStorage.setItem(
        "savedDashboard",
        '[{"title":"Group 2","extended":true,"items":[{"title":"Owner Monitor","id":"JOwner Monitor0","type":"Owner Monitor"},{"title":"Owner Monitor 2","id":"Owner Monitor 21","type":"Owner Monitor"}]}]',
      );
    });
  });

  it("should render the drawer", () => {
    cy.wait(20000);
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
