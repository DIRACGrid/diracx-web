/// <reference types="cypress" />
/// <reference path="support/index.d.ts" />

import {
  setupJobMonitorDashboard,
  ensureMinimumJobs,
} from "./support/jobMonitorUtils";

describe("Job Monitor - Pagination", () => {
  beforeEach(() => {
    cy.login();

    cy.visit("/");
    setupJobMonitorDashboard();

    cy.contains("Job Monitor").click();

    ensureMinimumJobs(55);
  });

  it("should render the drawer", () => {
    cy.get("header").contains("Job Monitor").should("be.visible");
  });

  it("should make sure the initial pagination is correct", () => {
    cy.get('[aria-label="Go to previous page"]').should("be.disabled");
    cy.get('[aria-label="Go to first page"]').should("be.disabled");
    cy.get('[aria-label="Go to next page"]').should("not.be.disabled");
    cy.get('[aria-label="Go to last page"]').should("not.be.disabled");

    cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
      const text = $pagination.text(); // e.g., "1-25 of 55"
      expect(text).to.match(/\d+[–-]\d+ of \d+/);
    });

    let firstValue: number;
    let lastValue: number;

    // Get the first visible row value (e.g. 55)
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValue = parseInt(text.trim(), 10);
      });

    // Scroll and get the last visible row value (e.g. 31)
    cy.get('[data-testid="virtuoso-scroller"]')
      .wait(100)
      .scrollTo("bottom", { ensureScrollable: false });

    cy.get("table tbody tr")
      .last()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        lastValue = parseInt(text.trim(), 10);
        expect(firstValue).to.be.greaterThan(lastValue);
      });
  });

  it("should go to the next page", () => {
    let firstValue: number;
    let firstValueNextPage: number;

    // Get the first visible row value (e.g. 55)
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValue = parseInt(text.trim(), 10);
      });

    // Go to the next page
    cy.get('[aria-label="Go to next page"]').click();

    cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
      // Extract the page index, the number of items per page and the total number of items
      const text = $pagination.text(); // "26-50 of 55"
      expect(text).to.match(/\d+[–-]\d+ of \d+/);

      // Extract numbers using a regular expression
      const match = text.match(/\d+/g);
      if (match) {
        const [pageIndexBegin, pageIndexEnd, totalItems] = match.map(Number);
        expect(pageIndexBegin).to.equal(26);
        expect(pageIndexEnd).to.equal(50);
        expect(totalItems).to.be.greaterThan(50);
      }
    });

    cy.get("table tbody tr")
      .last()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValueNextPage = parseInt(text.trim(), 10);
        expect(firstValue).to.be.greaterThan(firstValueNextPage);
      });
  });

  it("should change the page size", () => {
    cy.get(".MuiTablePagination-input .MuiSelect-select").click();

    cy.get('ul[role="listbox"]') // MUI renders this when the dropdown opens
      .should("be.visible")
      .contains("li", "50") // Target the <li> inside the listbox with value 50
      .click();

    cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
      // Extract the page index, the number of items per page and the total number of items
      const text = $pagination.text(); // "1-50 of 55"
      expect(text).to.match(/\d+[–-]\d+ of \d+/);

      // Extract numbers using a regular expression
      const match = text.match(/\d+/g);
      if (match) {
        const [pageIndexBegin, pageIndexEnd, totalItems] = match.map(Number);
        expect(pageIndexBegin).to.equal(1);
        expect(pageIndexEnd).to.equal(50);
        expect(totalItems).to.be.greaterThan(50);
      }
    });

    // Wait for the table to update with new page size
    cy.get(".MuiTablePagination-displayedRows").should("contain", "1");

    let firstValue: number;
    let lastValue: number;

    // Get the first visible row value (e.g. 55)
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        firstValue = parseInt(text.trim(), 10);
      });

    // Scroll and get the last visible row value
    cy.get('[data-testid="virtuoso-scroller"]')
      .wait(100)
      .scrollTo("bottom", { ensureScrollable: false });

    cy.get("table tbody tr")
      .last()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        lastValue = parseInt(text.trim(), 10);
        expect(firstValue).to.be.greaterThan(lastValue);
      });
  });
});
