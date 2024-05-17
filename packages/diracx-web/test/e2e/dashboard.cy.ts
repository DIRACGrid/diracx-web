/// <reference types="cypress" />

describe("DashboardDrawer", { retries: { runMode: 5, openMode: 3 } }, () => {
  beforeEach(() => {
    cy.session("login", () => {
      // Visit the page where the DashboardDrawer is rendered
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
    cy.visit("/");
  });

  it("should render the drawer", () => {
    // Check if the drawer is rendered
    cy.contains("Job Monitor").should("be.visible");
  });

  it("should toggle the group on button click", () => {
    cy.contains("Dashboard").click();
    // Check if the drawer is not visible after clicking the toggle button
    cy.contains("Job Monitor").should("not.be.visible");
  });

  it("should handle application addition", () => {
    cy.contains("Add application").click();

    cy.get("button").contains("Dashboard").click().click();

    cy.contains("Other").click();
    // Check if the application is added
    cy.contains("Dashboard 2").should("be.visible");
  });

  it("should handle application deletion", () => {
    cy.get(".MuiListItemButton-root").contains("Dashboard").rightclick();
    cy.contains("Delete").click();

    // Check if the application is deleted
    cy.get(".MuiListItemButton-root").contains("Dashboard").should("not.exist");
  });

  it("should handle application renaming", () => {
    cy.get(".MuiListItemButton-root").contains("Dashboard").rightclick();
    cy.contains("Rename").click();

    cy.get("input").type("Dashboard 1");
    cy.get("button").contains("Rename").click();

    // Check if the application is renamed
    cy.get(".MuiListItemButton-root")
      .contains("Dashboard 1")
      .should("be.visible");
  });

  it("should handle group creation", () => {
    cy.contains("Dashboard").rightclick();
    cy.contains("New Group").click();

    cy.contains("Group 3").should("be.visible");
  });

  it("should handle group deletion", () => {
    cy.contains("Other").rightclick();
    cy.contains("Delete").click();

    // Check if the group is deleted
    cy.contains("Other").should("not.exist");
  });

  it("should handle group renaming", () => {
    cy.contains("Other").rightclick();
    cy.contains("Rename").click();

    cy.get("input").type("Other 1");
    cy.get("button").contains("Rename").click();

    // Check if the group is renamed
    cy.contains("Other 1").should("be.visible");
  });

  it("should create a the app in a new group if there is no group", () => {
    cy.contains("Dashboard").rightclick();
    cy.contains("Delete").click();
    cy.contains("Other").rightclick();
    cy.contains("Delete").click();

    cy.contains("Add application").click();
    cy.get("button").contains("Job Monitor").click().click();

    cy.contains("Group 1").should("be.visible");

    cy.contains("Group 1").click();

    cy.contains("Job Monitor 1").should("be.visible");
  });

  it("should persist the state of the drawer", () => {
    cy.contains("Dashboard").click();

    // Check if the drawer is not visible before reloading
    cy.contains("Job Monitor").should("not.be.visible");
    cy.url().should("include", "sections=");

    cy.reload();
    // Check if the drawer is still not visible after reloading
    cy.contains("Job Monitor").should("not.be.visible");
  });

  it("should load the state of the drawer from url", () => {
    cy.visit(
      "/?sections=%5B%28%27title%21%27Test+Value%27~extended%21true~items%21%5B%5D%29%5D_",
    );

    // Check if there is a group with the title "Test Value"
    cy.contains("Test Value").should("be.visible");
  });

  it("should navigate to the application on click", () => {
    cy.contains("Job Monitor").click();

    // Check if the application is navigated to
    cy.url().should("include", "JobMonitor0");
  });

  it("should handle drag and drop for items", () => {
    dragAndDrop(
      cy.contains("[draggable=true]", "Job Monitor").first(),
      cy.contains("[data-drop-target-for-element=true]", "Other").first(),
      cy.get(
        '.MuiAccordionDetails-root > :nth-child(2) > .MuiButtonBase-root  .css-1blhdvq-MuiListItemIcon-root > [data-testid="DragIndicatorIcon"]',
      ),
    );

    // Check if the application is dropped
    cy.get(":nth-child(2) > .MuiPaper-root")
      .contains("Job Monitor")
      .should("be.visible");
  });
});

function dragAndDrop(
  source: Cypress.Chainable<JQuery<HTMLElement>>,
  target: Cypress.Chainable<JQuery<HTMLElement>>,
  handle?: Cypress.Chainable<JQuery<HTMLElement>>,
) {
  target.then(($target) => {
    const target = $target[0];
    const dataTransfer = new DataTransfer();
    const rect = target.getBoundingClientRect();
    const targetPos = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pageX: rect.left + rect.width / 2,
      pageY: rect.top + rect.height / 2,
    };

    source.first().then(($src) => {
      const src = $src[0];
      const rect = src.getBoundingClientRect();
      const srcPos = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        pageX: rect.left + rect.width / 2,
        pageY: rect.top + rect.height / 2,
      };

      // use the handle if provided
      if (handle) {
        handle.first().then(($handle) => {
          const handle = $handle[0];
          const handleRect = handle.getBoundingClientRect();
          const handlePos = {
            clientX: handleRect.left + handleRect.width / 2,
            clientY: handleRect.top + handleRect.height / 2,
            pageX: handleRect.left + handleRect.width / 2,
            pageY: handleRect.top + handleRect.height / 2,
          };

          // pick up
          src.dispatchEvent(
            new DragEvent("dragstart", {
              dataTransfer,
              bubbles: true,
              ...handlePos,
            }),
          );

          //drag
          target.dispatchEvent(
            new DragEvent("dragover", {
              dataTransfer,
              bubbles: true,
              ...targetPos,
            }),
          );

          // drop
          target.dispatchEvent(
            new DragEvent("drop", {
              dataTransfer,
              bubbles: true,
              ...targetPos,
            }),
          );
        });
      } else {
        // pick up
        src.dispatchEvent(
          new DragEvent("dragstart", {
            dataTransfer,
            bubbles: true,
            ...srcPos,
          }),
        );

        //drag
        target.dispatchEvent(
          new DragEvent("dragover", {
            dataTransfer,
            bubbles: true,
            ...targetPos,
          }),
        );

        // drop
        target.dispatchEvent(
          new DragEvent("drop", { dataTransfer, bubbles: true, ...targetPos }),
        );
      }
    });
  });
}
