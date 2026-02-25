/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Columns", () => {
  beforeEach(() => {
    cy.login();

    cy.visit("/");
    setupJobMonitorDashboard();

    cy.contains("Job Monitor").click();

    ensureMinimumJobs(55);
  });

  it("should hide/show columns", () => {
    // Make sure "VO" is not in the header and "Status" is
    cy.get("table thead tr th").should("not.contain", "VO");
    cy.get("table thead tr th").should("contain", "Status");

    // Click on the visibility icon
    cy.get('[data-testid="column-visibility-button"]').click();
    cy.get('[data-testid="column-visibility-popover"]').should("be.visible");

    // Hide the "Site" column and Show the "VO" column
    cy.get('[data-testid="column-visibility-popover"]')
      .contains("Site")
      .parent()
      .find('input[type="checkbox"]')
      .click();
    cy.get('[data-testid="column-visibility-popover"]')
      .contains("VO")
      .parent()
      .find('input[type="checkbox"]')
      .click();

    // Close the popover by clicking outside
    cy.get("body").click(0, 0);
    cy.get('[data-testid="column-visibility-popover"]').should("not.exist");

    // Wait for the table to re-render with updated columns
    cy.wait(1000);

    // Verify "VO" is now present and "Site" is gone
    cy.get("table thead tr th").should("contain", "VO");
    cy.get("table thead tr th").should("not.contain", "Site");
  });

  it("should resize a column", () => {
    cy.get("table thead tr th")
      .eq(2)
      .invoke("width")
      .then((initialWidth) => {
        // Convert the width to a number
        const initialWidthNum = Number(initialWidth);

        // Resize the column
        cy.get(
          ".MuiTableHead-root > .MuiTableRow-root > :nth-child(3) > .MuiBox-root",
        )
          .trigger("mousedown", { which: 1 }) // Start the drag
          .trigger("mousemove", { clientX: 200 }) // Move to the desired location
          .trigger("mouseup"); // Release to finish resizing

        // Check if the column width has changed (it should be larger than the initial width)
        cy.get("table thead tr th")
          .eq(2)
          .invoke("width")
          .then((newWidth) => {
            // Convert the new width to a number and compare
            const newWidthNum = Number(newWidth);
            expect(initialWidthNum).to.be.greaterThan(newWidthNum);
          });
      });
  });

  it("should sort column", () => {
    let firstValue: number;
    let firstValueSorted: number;
    let firstValueAgain: number;

    // Get the first visible row value (e.g. 55)
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValue = parseInt(text.trim(), 10);
      });

    cy.get('[data-testid="sort-JobID"]').click();

    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValueSorted = parseInt(text.trim(), 10);
        expect(firstValue).to.be.greaterThan(firstValueSorted);
      });

    cy.get('[data-testid="sort-JobID"]').click();

    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValueAgain = parseInt(text.trim(), 10);
        expect(firstValueAgain).to.be.greaterThan(firstValueSorted);
        expect(firstValue).to.be.equal(firstValueAgain);
      });
  });
});
