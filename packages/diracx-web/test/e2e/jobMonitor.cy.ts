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
      "/?appId=JobMonitor0&dashboard=6%21%27My+dashboard%27~extended%21true~items%216*.~id430%27%29%2C-5%27~id51.%29%5D%29%5D*4+3-%28%27title.%27~type*%273Monitor4%21%27Job5*+26%5B-%016543.-*_&userDashboard=6%21%27Test+Group%27~extended%21true~items%216*.~id430%27%29%2C-5%27~id51.%29%5D%29%5D*4+3-%28%27title.%27~type*%273Monitor4%21%27Job5*+26%5B-%016543.-*_",
    );

    // Is there a table with enough jobs? If not we should add some jobs
    const checkAndAddJobs = (minNumberOfJobs) => {
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
      } else {
        cy.log("Data available, checking if enough jobs are present");
        checkAndAddJobs(55);
      }
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

    // Scroll and get the last visible row value (e.g. 6)
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
    cy.get("[data-index=1]").click();
    cy.get("[data-index=2]").click();
    cy.get("[data-index=3]").click();

    cy.get('[data-testid="ClearIcon"] > path').click();

    // Make sure the job status is "Killed"
    cy.get("[data-index=1]").find("td").eq(2).should("contain", "Killed");
    cy.get("[data-index=2]").find("td").eq(2).should("contain.text", "Killed");
    cy.get("[data-index=3]").find("td").eq(2).should("contain.text", "Killed");
  });

  it("should delete jobs", () => {
    cy.get("[data-index=1]").as("jobItem1");
    cy.get("[data-index=2]").as("jobItem2");
    cy.get("[data-index=3]").as("jobItem3");
    cy.get("@jobItem1").click();
    cy.get("@jobItem2").click();
    cy.get("@jobItem3").click();

    cy.get('[data-testid="delete-jobs-button"] > path').click();

    // Make sure the jobs disappeared from the table
    cy.get("table").should("be.visible");
    cy.get("@jobItem1").should("not.exist");
    cy.get("@jobItem2").should("not.exist");
    cy.get("@jobItem3").should("not.exist");
  });

  it("should reschedule jobs", () => {
    cy.get("[data-index=1]").click();
    cy.get("[data-index=2]").click();
    cy.get("[data-index=3]").click();

    cy.get('[data-testid="ReplayIcon"] > path').click();

    // Make sure the job status is "Received"
    cy.get("[data-index=1]").find("td").eq(2).should("contain", "Received");
    cy.get("[data-index=1]").find("td").eq(2).should("contain", "Received");
    cy.get("[data-index=1]").find("td").eq(2).should("contain", "Received");
  });

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

    // Click on the visibility icon
    cy.get('[data-testid="VisibilityIcon"] > path').click();
    cy.get('[data-testid="column-visibility-popover"]').should("be.visible");

    // Hide the "Status" column and Show the "VO" column
    cy.get('[data-testid="column-visibility-popover"]').within(() => {
      cy.contains("VO").parent().find('input[type="checkbox"]').click();
    });
    cy.get('[data-testid="column-visibility-popover"]').within(() => {
      cy.contains("Status").parent().find('input[type="checkbox"]').click();
    });

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
    cy.get("button").contains("Add filter").click();

    // "Apply filters" button should not be visible (only the refresh button)
    cy.get("button").contains("Refresh page").should("exist");
    cy.get("button").contains("Apply filters").should("not.exist");

    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobID"]').click();
    cy.get("#value").type("1");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");
    // Filters should not be applied yet
    cy.get("table tbody tr").should("not.have.length", 1);

    // "Apply filters" button should be visible (not the refresh button)
    cy.get("button").contains("Apply filters").should("exist");
    cy.get("button").contains("Refresh page").should("not.exist");
  });

  it("should handle filter deletion", () => {
    cy.get("table").should("be.visible");
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get('[data-testid="CancelIcon"]').click();
    cy.get(".MuiChip-label").should("not.exist");
  });

  it("should handle filter editing", () => {
    cy.get("table").should("be.visible");
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get(".MuiChip-label").click();
    cy.get("#value").clear().type("test2");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").contains("test2").should("be.visible");
  });

  it("should handle filter clear", () => {
    cy.get("table").should("be.visible");
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Add filter").click();
    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobName"]').click();
    cy.get("#value").type("test2");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Clear all").click();

    cy.get(".MuiChip-label").should("not.exist");
  });

  it("should handle filter apply and persist", () => {
    cy.get("table").should("be.visible");
    cy.get("button").contains("Add filter").click();

    let jobId: string;

    // Get the first visible row value (e.g. 55)
    cy.get("table tbody tr")
      .first()
      .find("td")
      .eq(1)
      .invoke("text")
      .then((text) => {
        jobId = text.trim();

        cy.get(
          '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
        ).click();
        cy.get('[data-value="JobID"]').click();
        cy.get("#value").type(jobId);
      });
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Apply").click();
    cy.wait(500);
    cy.reload();

    cy.get(".MuiChip-label").should("be.visible");
    cy.get("table tbody tr").should("have.length", 1);
  });

  it("should handle filter apply and save filters in dashboard", () => {
    cy.get("table").should("be.visible");
    cy.get("button").contains("Add filter").click();

    cy.get(
      '[data-testid="filter-form-select-parameter"] > .MuiSelect-select',
    ).click();
    cy.get('[data-value="JobID"]').click();
    cy.get("#value").type("5");
    cy.get('[data-testid="filter-form-add-button"]').contains("Add").click();

    cy.get(".MuiChip-label").should("be.visible");

    cy.get("button").contains("Apply").click();
    cy.wait(500);
    cy.get(".MuiButtonBase-root").contains("Job Monitor 2").click();

    cy.get(".MuiChip-label").should("not.exist");

    cy.get(".MuiButtonBase-root").contains("Job Monitor").click();
    cy.get(".MuiChip-label").should("be.visible");
  });
});
