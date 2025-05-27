/// <reference types="cypress" />

describe("Export and import app state", () => {
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

    cy.visit("/");

    // Open 2 Job Monitor apps
    cy.get('[data-testid="add-application-button"]').click();
    cy.get('[data-testid="create-application-button"]')
      .contains("Job Monitor")
      .click();
    cy.get('[data-testid="add-application-button"]').click();
    cy.get('[data-testid="create-application-button"]')
      .contains("Job Monitor")
      .click();
  });

  it("export button should be visible", () => {
    cy.get('[aria-label="Export application state"]')
      .should("be.visible")
      .click();

    // Select 2 items to share
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 21"]').click();

    // Share and cancel the export
    cy.contains("Export 2 selected").should("be.visible").click();
    cy.contains("Cancel").should("be.visible").click();

    // Select 1 item and share it
    cy.get('[aria-label="Export application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.contains("Export 1 selected").should("be.visible").click();
  });

  // Test case to check the copy of the non-empty state
  it("should copy a non-empty state", () => {
    // Select the Job Monitor app
    cy.get('[aria-label="Export application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-Job Monitor 21"]').click();
    cy.contains("Export 1 selected").should("be.visible").click();

    // Copy and assert the state
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").as("writeTextStub");
    });

    cy.contains("Copy").click();

    cy.get("@writeTextStub").should(
      "have.been.calledOnceWithExactly",
      '[\n  {\n    "appType": "Job Monitor",\n    "appName": "Job Monitor 2",\n    "state": "{\\"filters\\":[],\\"columnVisibility\\":{\\"JobGroup\\":false,\\"JobType\\":false,\\"Owner\\":false,\\"OwnerGroup\\":false,\\"VO\\":false,\\"StartExecTime\\":false,\\"EndExecTime\\":false,\\"UserPriority\\":false},\\"columnPinning\\":{\\"left\\":[\\"JobID\\"],\\"right\\":[]},\\"rowSelection\\":{},\\"pagination\\":{\\"pageIndex\\":0,\\"pageSize\\":25}}"\n  }\n]',
    );
  });

  it("should copy multiple states", () => {
    // Open My Jobs:
    cy.contains("My Jobs").click();

    cy.get('[aria-label="Export application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 21"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 32"]').click();
    cy.contains("Export 3 selected").should("be.visible").click();

    cy.contains('"appType": "Job Monitor"');
  });

  it("should the import button be visible", () => {
    cy.get('[aria-label="Import application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.contains("Cancel").should("be.visible").click();
    cy.contains("Paste your application state here...").should("not.exist");
  });

  it("should not import what's not a valid JSON", () => {
    cy.get('[aria-label="Import application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[datatype="import-menu-field"]').type(
      "Houston, we have a problem: this isn't JSON.",
    );
    cy.get("button").contains("Import").click();
    cy.contains("Invalid JSON format").should("be.visible");
  });

  it("should import the empty state", () => {
    cy.get('[aria-label="Import application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[datatype="import-menu-field"]').type(
      '[\n  {\n    "appType": "Job Monitor",\n    "state": "null"\n  }\n]',
    );
    cy.get("button").contains("Import").click();
    cy.contains("Imported Applications").should("not.exist");
  });

  // Test case to check the import of the non-empty state
  it("should import the non-empty state", () => {
    cy.get('[aria-label="Import application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[datatype="import-menu-field"]').type(
      `[
      {
    "appType": "Job Monitor",
    "appName": "Job Monitor 2",
    "state": "{\\"filters\\":[],\\"columnVisibility\\":{\\"JobGroup\\":false,\\"JobType\\":false,\\"Owner\\":false,\\"OwnerGroup\\":false,\\"VO\\":false,\\"StartExecTime\\":false,\\"EndExecTime\\":false,\\"UserPriority\\":false},\\"columnPinning\\":{\\"left\\":[\\"JobID\\"],\\"right\\":[]},\\"rowSelection\\":{},\\"pagination\\":{\\"pageIndex\\":0,\\"pageSize\\":25}}"
  }
]`,
      { parseSpecialCharSequences: false },
    );
    cy.get("button").contains("Import").click();
    cy.contains("Imported Applications").should("be.visible");

    cy.contains("Job Monitor 2").click();
    cy.get(".MuiTypography-h4").contains("Job Monitor 2");
  });
});
