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

    cy.visit("/");
    // Visit the page where the Job Monitor is rendered
    cy.window().then((win) => {
      win.sessionStorage.setItem(
        "savedDashboard",
        '[{"title":"Group 2","extended":true,"items":[{"title":"Job Monitor","id":"Job Monitor0","type":"Job Monitor"},{"title":"Job Monitor 2","id":"Job Monitor 21","type":"Job Monitor"}]}]',
      );
    });

    cy.contains("Job Monitor").click();

    // Is there a table with enough jobs? If not we should add some jobs
    const checkAndAddJobs = (minNumberOfJobs: number) => {
      cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
        const lastNumber = parseInt($pagination.text().split(" ").pop() || "0");

        if (lastNumber < minNumberOfJobs) {
          const numberOfJobsToAdd = minNumberOfJobs - lastNumber;
          addJobs(numberOfJobsToAdd);
        } else {
          // Ensure the table is visible
          cy.get("table").should("be.visible");
        }
      });
    };

    const addJobs = (numberOfJobs) => {
      // Retrieve the access token from session storage
      cy.window().then((win) => {
        const sessionData = win.sessionStorage.getItem(
          "oidc.vo:diracAdmin group:admin",
        );

        if (!sessionData) {
          throw new Error("Access token not found in session storage");
        }

        const accessToken = JSON.parse(sessionData).tokens.accessToken;

        Cypress._.times(numberOfJobs, () => {
          cy.request({
            method: "POST",
            url: "/api/jobs/jdl",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: ['Arguments = "jobDescription.xml -o LogLevel=INFO'],
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    };

    cy.contains("Loading OIDC Configuration").should("not.exist");
    cy.contains("Loading").should("not.exist");
    cy.get('[data-testid="loading-skeleton"]').should("not.exist");

    cy.get("body").then(($body) => {
      if (
        $body.find('div:contains("No data or no results match your filters.")')
          .length > 0
      ) {
        cy.log("No data available, adding jobs");
        addJobs(55);
        // Wait for the jobs to be created
        cy.wait(2000);
      } else {
        cy.log("Data available, checking if enough jobs are present");
        checkAndAddJobs(55);
      }

      // refresh the jobs
      cy.get('[data-testid="RefreshIcon"]').click();
    });
  });

  it("should render the drawer", () => {
    cy.get("header").contains("Job Monitor").should("be.visible");
  });

  /** Pagination */

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
      const text = $pagination.text(); // "26-50 of 55"
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

    cy.wait(1000); // Wait for the table to update

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

  /** Row interactions */

  it("should display job history dialog", () => {
    cy.get("table tbody tr").first().find("td").eq(3).rightclick();

    // A context menu should appear
    cy.contains("Get history").should("be.visible");
    cy.contains("Get history").click();

    // A dialog should appear
    cy.contains("Job History:").should("be.visible");
  });

  it("should kill jobs", () => {
    cy.get("[data-index=0]").click({ force: true });
    cy.get("[data-index=1]").click({ force: true });
    cy.get("[data-index=2]").click({ force: true });

    cy.get('[data-testid="ClearIcon"] > path').click();

    // Make sure the job status is "Killed"
    cy.get("[data-index=0]").find("td").eq(2).should("contain", "Killed");
    cy.get("[data-index=1]").find("td").eq(2).should("contain.text", "Killed");
    cy.get("[data-index=2]").find("td").eq(2).should("contain.text", "Killed");
  });

  it("should delete jobs", () => {
    cy.get("[data-index=0]").as("jobItem1");
    cy.get("[data-index=1]").as("jobItem2");
    cy.get("[data-index=2]").as("jobItem3");
    cy.get("@jobItem1").click({ force: true });
    cy.get("@jobItem2").click({ force: true });
    cy.get("@jobItem3").click({ force: true });

    cy.get('[data-testid="delete-jobs-button"] > path').click();

    // Make sure the jobs disappeared from the table
    cy.get("table").should("be.visible");
    cy.get("@jobItem1").find("td").eq(2).should("contain", "Deleted");
    cy.get("@jobItem2").find("td").eq(2).should("contain", "Deleted");
    cy.get("@jobItem3").find("td").eq(2).should("contain", "Deleted");
  });

  // ### FIXME: The reschedule functionality is not working as expected ###
  // The test below would be decommented once the reschedule functionality is fixed in diracx

  // it("should reschedule jobs", () => {
  //   cy.wait(1000); // Wait for the table to load

  //   cy.get("[data-testid=search-field]").type("Reschedule Counter{enter}!={enter}3{enter}");

  //   cy.wait(1000); // Wait for the search to complete

  //   // Create aliases for the job items
  //   cy.get("[data-index=0]").as("jobItem1");
  //   cy.get("[data-index=1]").as("jobItem2");
  //   cy.get("[data-index=2]").as("jobItem3");

  //   // First, kill the jobs to ensure they can be rescheduled
  //   cy.get("@jobItem1").click({ force: true });
  //   cy.get("@jobItem2").click({ force: true });
  //   cy.get("@jobItem3").click({ force: true });

  //   cy.get('[data-testid="ClearIcon"] > path').click();

  //   // Then, select the jobs to reschedule
  //   cy.get("@jobItem1").click({ force: true });
  //   cy.get("@jobItem2").click({ force: true });
  //   cy.get("@jobItem3").click({ force: true });

  //   cy.get('[data-testid="ReplayIcon"] > path').click({ force: true });
  //   cy.get('[aria-label="Reschedule"]').click({ force: true });
  //   cy.get('[data-testid="ReplayIcon"] > path').click({ force: true });
  //   cy.get('[aria-label="Reschedule"]').click({ force: true });

  //   // Make sure the job status is "Received"
  //   cy.get("[data-index=0]").find("td").eq(2).should("contain", "Received");
  //   cy.get("[data-index=1]").find("td").eq(2).should("contain", "Received");
  //   cy.get("[data-index=2]").find("td").eq(2).should("contain", "Received");
  // });

  /** Column interactions */

  it("should hide/show columns", () => {
    // Loop over the table column and make sure that "VO" is not present
    cy.get("table thead tr th").each(($th) => {
      if ($th.text() === "VO") {
        expect($th).to.not.exist;
      }
      if ($th.text() === "Status") {
        expect($th).to.exist;
      }
    });

    cy.wait(1000); // Wait for the table to load

    // Click on the visibility icon
    cy.get('[data-testid="VisibilityIcon"] > path').click();
    cy.get('[data-testid="column-visibility-popover"]').should("be.visible");

    // Hide the "Status" column and Show the "VO" column
    cy.get('[data-testid="column-visibility-popover"]')
      .contains("Status")
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

    // Loop over the table column and make sure that "VO" is present
    cy.get("table thead tr th").each(($th) => {
      if ($th.text() === "VO") {
        expect($th).to.exist;
      }
      if ($th.text() === "Status") {
        expect($th).to.not.exist;
      }
    });
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

  /** Filters */

  it("should handle filter addition", () => {
    cy.get("table").should("be.visible");
    cy.get("[data-testid=search-bar]");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get('[role="group"]').find("button").should("have.length", 5);
  });

  it("should handle filter editing", () => {
    cy.get("table").should("be.visible");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get("[data-testid=search-field]").type("{leftArrow}2{enter}");
    cy.get('[role="group"]').find("button").contains("12").should("exist");
  });

  it("should handle filter clear", () => {
    cy.get("table").should("be.visible");

    cy.get("[data-testid=search-field]").type("ID{enter}={enter}1{enter}");

    cy.get('[role="group"]').find("button").should("have.length", 5);

    cy.get('[data-testid="DeleteIcon"]').click();

    cy.get('[role="group"]').find("button").should("have.length", 2);
  });

  it("should handle filter apply and persist", () => {
    cy.get("table").should("be.visible");

    let jobID: string;
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        jobID = text.trim();

        cy.get("[data-testid=search-field]").type(
          `ID{enter}={enter}${jobID}{enter}`,
        );
      });
    cy.get('[role="group"]').find("button").should("have.length", 5);
    cy.get('[role="group"]').find("button").contains("ID").should("exist");

    // Wait for the filter to apply
    cy.wait(1000);

    cy.get("table tbody tr").should("have.length", 1);
  });

  it("should handle filter apply and save filters in dashboard", () => {
    cy.get("table").should("be.visible");

    let jobID: string;
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        jobID = text.trim();

        cy.get("[data-testid=search-field]").type(
          `ID{enter}={enter}${jobID}{enter}`,
        );
      });

    // Wait for the filter to apply
    cy.wait(1000);

    cy.get('[role="group"]').find("button").should("have.length", 5);

    cy.get(".MuiButtonBase-root").contains("Job Monitor 2").click();

    cy.get('[role="group"]').find("button").should("have.length", 2);

    cy.get(".MuiButtonBase-root").contains("Job Monitor").click();

    cy.get('[role="group"]').find("button").should("have.length", 5);
  });

  it("should control the in the last operator utilization", () => {
    cy.get("table").should("be.visible");
    cy.get("[data-testid=search-field]").type(
      "Submission Time{enter}in the last{enter}4206942 years{enter}",
    );

    // Wait for the filter to apply
    cy.wait(1000);

    cy.get('[role="group"]').find("button").should("have.length", 5);

    cy.get("table").should("be.visible");
  });

  /** Sunburst */

  it("should render the sunburst chart", () => {
    // Click on the sunburst button
    cy.get('[role="group"]').get("[data-testid='DonutSmallIcon']").click();

    // Make sure the sunburst chart is visible
    cy.get('[data-testid="sunburst-chart"]').should("be.visible");

    // Make sure the column selector is visible
    cy.get('[data-testid="column-selector"]').should("be.visible");
  });
});
