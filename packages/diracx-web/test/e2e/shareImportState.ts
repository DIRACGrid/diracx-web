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

    cy.visit(
      "?dashboard=4dashboard%27%7Eextended%21true%7Eitems%2148s3*5B860795913*7A5A23-%27%29%5D%29%5D*B8+6-BFile+Catalog.%28%27title3%27%7Etype4%5B.BMy+5%27%7Eid6Monitor7%27%29%2C.8Job9*+2A-+1B%21%27%01BA9876543.-*_",
    );
  });

  it("export button should be visible", () => {
    cy.get('[aria-label="Share application state"]')
      .should("be.visible")
      .click();

    // Select 2 items to share
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 21"]').click();

    // Share and cancel the export
    cy.contains("Share 2 selected").should("be.visible").click();
    cy.contains("Cancel").should("be.visible").click();

    // Select 1 item and share it
    cy.get('[aria-label="Share application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.contains("Share 1 selected").should("be.visible").click();
  });

  // Test case to check the copy of the empty state
  it("should copy the empty state", () => {
    // Select the Job Monitor app
    cy.get('[aria-label="Share application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.contains("Share 1 selected").should("be.visible").click();

    // Copy and assert the state
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").as("writeTextStub");
    });

    cy.contains("Copy").click();

    cy.get("@writeTextStub").should(
      "have.been.calledOnceWithExactly",
      '[\n  {\n    "appType": "Job Monitor",\n    "state": "null"\n  }\n]',
    );
  });

  // Test case to check the copy of the non-empty state
  it("should copy a non-empty state", () => {
    // Open the Job Monitor app
    cy.visit(
      "?appId=JobMonitor0&dashboard=4dashboard%27%7Eextended%21true%7Eitems%2148s3*5B860795913*7A5A23-%27%29%5D%29%5D*B8+6-BFile+Catalog.%28%27title3%27%7Etype4%5B.BMy+5%27%7Eid6Monitor7%27%29%2C.8Job9*+2A-+1B%21%27%01BA9876543.-*_",
    );

    // Select the Job Monitor app
    cy.get('[aria-label="Share application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.contains("Share 1 selected").should("be.visible").click();

    // Copy and assert the state
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").as("writeTextStub");
    });

    cy.contains("Copy").click();

    cy.get("@writeTextStub").should(
      "have.been.calledOnceWithExactly",
      '[\n  {\n    "appType": "Job Monitor",\n    "state": "{\\"columnVisibility\\":{\\"JobGroup\\":false,\\"JobType\\":false,\\"Owner\\":false,\\"OwnerGroup\\":false,\\"VO\\":false,\\"StartExecTime\\":false,\\"EndExecTime\\":false,\\"UserPriority\\":false},\\"columnPinning\\":{\\"left\\":[\\"JobID\\"],\\"right\\":[]},\\"rowSelection\\":{},\\"pagination\\":{\\"pageIndex\\":0,\\"pageSize\\":25}}"\n  }\n]',
    );
  });

  it("should copy multiple states", () => {
    cy.visit(
      "?dashboard=6dashboard'~extended!true~items!6As4*7DA9058278214*5B7B24-58378334*')])]*DA+9-DFile+Catalog.('title4'~type5')%2C.6[.DMy+7'~id8*+9MonitorAJobB-+1D!'%01DBA987654.-*_",
    );
    // Open:
    // -My Jobs
    cy.visit(
      "?appId=JobMonitor0&dashboard=6dashboard'~extended!true~items!6As4*7DA9058278214*5B7B24-58378334*')])]*DA+9-DFile+Catalog.('title4'~type5')%2C.6[.DMy+7'~id8*+9MonitorAJobB-+1D!'%01DBA987654.-*_",
    );
    // -Job Monitor 2
    cy.visit(
      "?appId=Job+Monitor+21&dashboard=6dashboard'~extended!true~items!6As4*7DA9058278214*5B7B24-58378334*')])]*DA+9-DFile+Catalog.('title4'~type5')%2C.6[.DMy+7'~id8*+9MonitorAJobB-+1D!'%01DBA987654.-*_",
    );
    // -Job Monitoring 3
    cy.visit(
      "?appId=Job+Monitor+33&dashboard=6dashboard'~extended!true~items!6As4*7DA9058278214*5B7B24-58378334*')])]*DA+9-DFile+Catalog.('title4'~type5')%2C.6[.DMy+7'~id8*+9MonitorAJobB-+1D!'%01DBA987654.-*_",
    );

    cy.get('[aria-label="Share application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="export-menu"]').should("be.visible");
    cy.get('[data-testid="checkbox-JobMonitor0"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 21"]').click();
    cy.get('[data-testid="checkbox-Job Monitor 33"]').click();
    cy.contains("Share 3 selected").should("be.visible").click();

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
    cy.get("#«ra»").type("Houston, we have a problem: this isn't JSON.");
    cy.get("button").contains("Import").click();
    cy.contains("Invalid JSON format").should("be.visible");
  });

  it("should import the empty state", () => {
    cy.get('[aria-label="Import application state"]')
      .should("be.visible")
      .click();
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get('[data-testid="import-menu"]').should("be.visible");
    cy.get("#«ra»").type(
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
    cy.get("#«ra»").type(
      `[
      {
    "appType": "Job Monitor",
    "state": "{\\"columnVisibility\\":{\\"JobGroup\\":false,\\"JobType\\":false,\\"Owner\\":false,\\"OwnerGroup\\":false,\\"VO\\":false,\\"StartExecTime\\":false,\\"EndExecTime\\":false,\\"UserPriority\\":false},\\"columnPinning\\":{\\"left\\":[\\"JobID\\"],\\"right\\":[]},\\"rowSelection\\":{},\\"pagination\\":{\\"pageIndex\\":0,\\"pageSize\\":25}}"
  }
]`,
      { parseSpecialCharSequences: false },
    );
    cy.get("button").contains("Import").click();
    cy.contains("Imported Applications").should("be.visible");

    cy.contains("Job Monitor 3").click();
    cy.get(".MuiTypography-h4").contains("Job Monitor 3");
    cy.contains("No data or no");
  });
});
