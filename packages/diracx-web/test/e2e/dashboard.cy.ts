/// <reference types="cypress" />

describe("DashboardDrawer", { retries: { runMode: 5, openMode: 3 } }, () => {
  beforeEach(() => {
    cy.session("login", () => {
      // Visit the page where the DashboardDrawer is rendered
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
    cy.window().then((win) => {
      win.sessionStorage.setItem(
        "savedDashboard",
        '[{"title":"My dashboard","extended":true,"items":[{"title":"My Jobs","type":"Job Monitor","id":"JobMonitor0"}]},{"title":"Others","extended":false,"items":[]}]',
      );
    });

    cy.visit("/");
  });

  it("should render the drawer", () => {
    // Check if the drawer is rendered
    cy.contains("My Jobs").should("be.visible");
  });

  it("should toggle the group on button click", () => {
    cy.contains("My dashboard").click();
    // Check if the drawer is not visible after clicking the toggle button
    cy.get(".MuiButtonBase-root").contains("My Jobs").should("not.be.visible");
  });

  it("should handle application addition", () => {
    cy.contains("Add application").click();

    cy.get("button").contains("Job Monitor").click();

    cy.contains("Others").click();
    // Check if the application is added
    cy.contains("Job Monitor 2").should("be.visible");
  });

  it("should handle application deletion", () => {
    cy.get(".MuiListItemButton-root").contains("My Jobs").rightclick();
    cy.contains("Delete").click();

    // Check if the application is deleted
    cy.get(".MuiListItemButton-root").contains("My Jobs").should("not.exist");
  });

  it("should handle application renaming", () => {
    cy.get(".MuiListItemButton-root").contains("My Jobs").rightclick();
    cy.contains("Rename").click();
    cy.get("input").first().type("=^.^=");
    cy.get("input").first().type("{enter}");

    // Check if the application is renamed
    cy.get(".MuiListItemButton-root").contains("=^.^=").should("be.visible");
  });

  it("should handle group creation", () => {
    cy.get('[data-testid="drawer-permanent"]').rightclick({ force: true });
    cy.contains("New Group").click();

    cy.contains("Group 3").should("be.visible");
  });

  it("should handle group deletion", () => {
    cy.contains("Others").rightclick();
    cy.contains("Delete").click();

    // Check if the group is deleted
    cy.contains("Others").should("not.exist");
  });

  it("should handle group renaming", () => {
    cy.contains("Others").rightclick();
    cy.contains("Rename").click();

    cy.get("input").first().type("Other 1");
    cy.get("input").first().type("{enter}");

    // Check if the group is renamed
    cy.contains("Other 1").should("be.visible");
  });

  it("should create a new group if there is no group", () => {
    cy.contains("My dashboard").rightclick();
    cy.contains("Delete").click();
    cy.contains("Others").rightclick();
    cy.contains("Delete").click();

    cy.contains("Add application").click();
    cy.get("button").contains("Job Monitor").click().click();

    cy.contains("Group 1").should("be.visible");

    cy.contains("Group 1").click();

    cy.contains("Job Monitor").should("be.visible");
  });

  it("should persist the state of the drawer", () => {
    cy.contains("My dashboard").click();

    // Check if the drawer is not visible before reloading
    cy.get(".MuiButtonBase-root").contains("My Jobs").should("not.be.visible");
    cy.wait(500);

    cy.reload();
    // Check if the drawer is still not visible after reloading
    cy.get(".MuiButtonBase-root").contains("My Jobs").should("not.be.visible");
  });

  it("should load the state of the drawer from session storage", () => {
    // Check if the session storage is correctly loaded
    cy.contains("My Jobs").should("be.visible");
    cy.contains("Others").should("be.visible");
    cy.contains("My dashboard").should("be.visible");
  });

  it("should navigate to the application on click", () => {
    cy.contains("My Jobs").click();
    // Check if the application is navigated to
    cy.contains("Job Monitor").should("be.visible");
  });

  it("should handle drag and drop for items", () => {
    dragAndDrop(
      cy.contains("[draggable=true]", "My Jobs").first(),
      cy.contains("[data-drop-target-for-element=true]", "Others").first(),
      cy.get('[data-testid="drag-handle"]').eq(0),
    );

    // Check if the application is dropped
    cy.get(":nth-child(2) > .MuiPaper-root")
      .contains("My Jobs")
      .should("be.visible");

    cy.window().then((win) => {
      const value = win.sessionStorage.getItem("savedDashboard");
      expect(value).to.equal(
        '[{"title":"My dashboard","extended":true,"items":[]},{"title":"Others","extended":true,"items":[{"title":"My Jobs","type":"Job Monitor","id":"JobMonitor0"}]}]',
      );
    });
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
