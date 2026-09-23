/**
 * Set up the dashboard with two Job Monitor apps via sessionStorage.
 * Call this after cy.login() and before cy.visitApp().
 */
export function setupJobMonitorDashboard() {
  cy.window().then((win) => {
    win.sessionStorage.setItem(
      "savedDashboard",
      '[{"title":"Group 2","extended":true,"items":[{"title":"Job Monitor","id":"Job Monitor0","type":"Job Monitor"},{"title":"Job Monitor 2","id":"Job Monitor 21","type":"Job Monitor"}]}]',
    );
  });
}

/**
 * Submit jobs to the backend using the API.
 */
export function addJobs(numberOfJobs: number) {
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
        expect(response.status).to.eq(201);
      });
    });
  });
}

/**
 * Statuses of jobs the demo's dummy job executor has not processed yet.
 */
const PENDING_EXECUTION_STATUSES = ["Received", "Waiting", "Matched"];

/**
 * Wait until the demo's dummy job executor is done with the given jobs.
 *
 * The executor records the final "Done" status a few seconds in the future,
 * and DiracX ignores status updates older than a job's latest record: also
 * wait for every record to be in the past.
 */
function waitForJobsExecuted(
  accessToken: string,
  jobIds: number[],
  attempts = 30,
) {
  cy.request({
    method: "POST",
    url: "/api/jobs/search",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      parameters: ["JobID", "Status", "LoggingInfo"],
      search: [{ parameter: "JobID", operator: "in", values: jobIds }],
    },
  }).then((response) => {
    const jobs: { Status: string; LoggingInfo: { StatusTime: string }[] }[] =
      response.body;
    const executed =
      jobs.length === jobIds.length &&
      jobs.every(
        (job) =>
          !PENDING_EXECUTION_STATUSES.includes(job.Status) &&
          job.LoggingInfo.every(
            (record) => Date.parse(record.StatusTime) < Date.now(),
          ),
      );

    if (executed) {
      return;
    }
    if (attempts <= 1) {
      throw new Error(`Jobs ${jobIds.join(", ")} were not executed in time`);
    }
    cy.wait(1000);
    waitForJobsExecuted(accessToken, jobIds, attempts - 1);
  });
}

/**
 * Force jobs into the given status, bypassing the job state machine.
 *
 * The demo's dummy job executor moves every submitted job to "Done", a final
 * state: use this to put jobs back into a state the tests can act on.
 */
export function forceJobsStatus(jobIds: number[], status: string) {
  cy.window().then((win) => {
    const sessionData = win.sessionStorage.getItem(
      "oidc.vo:diracAdmin group:admin",
    );

    if (!sessionData) {
      throw new Error("Access token not found in session storage");
    }

    const accessToken = JSON.parse(sessionData).tokens.accessToken;

    // Otherwise the executor could override the forced status, or DiracX
    // could ignore it
    waitForJobsExecuted(accessToken, jobIds);

    cy.then(() => {
      const now = new Date().toISOString();

      cy.request({
        method: "PATCH",
        url: "/api/jobs/status?force=true",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: Object.fromEntries(
          jobIds.map((jobId) => [
            jobId,
            {
              [now]: {
                Status: status,
                MinorStatus: "Cypress",
                Source: "Cypress",
              },
            },
          ]),
        ),
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
}

/**
 * Create a sandbox, upload it, submit a job, and assign the sandbox as output.
 * Returns a Cypress chainable that yields the job ID.
 *
 * Note: Input sandbox assignment is handled by DIRAC (not DiracX), so it
 * cannot be tested in the demo environment. Output sandbox assignment is
 * supported via the DiracX API.
 */
export function addJobWithOutputSandbox() {
  return cy.window().then(async (win) => {
    const sessionData = win.sessionStorage.getItem(
      "oidc.vo:diracAdmin group:admin",
    );
    if (!sessionData) {
      throw new Error("Access token not found in session storage");
    }
    const accessToken = JSON.parse(sessionData).tokens.accessToken;
    const baseUrl = Cypress.config("baseUrl");

    // Create random sandbox data
    const data = new Uint8Array(512);
    crypto.getRandomValues(data);

    // Compute SHA-256 checksum
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const checksum = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Step 1: Initiate sandbox upload
    const initRes = await fetch(`${baseUrl}/api/jobs/sandbox`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checksum_algorithm: "sha256",
        checksum,
        size: data.byteLength,
        format: "tar.bz2",
      }),
    });
    if (!initRes.ok) {
      throw new Error(`Initiate sandbox upload failed: ${initRes.status}`);
    }
    const uploadInfo = await initRes.json();
    const sandboxPfn: string = uploadInfo.pfn;

    // Step 2: Upload the file to the presigned URL
    if (uploadInfo.url) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(
        uploadInfo.fields as Record<string, string>,
      )) {
        formData.append(key, value);
      }
      formData.append("file", new Blob([data]), "file");
      const uploadRes = await fetch(uploadInfo.url, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        throw new Error(`Sandbox file upload failed: ${uploadRes.status}`);
      }
    }

    // Step 3: Submit a job
    const jobRes = await fetch(`${baseUrl}/api/jobs/jdl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        'Arguments = "jobDescription.xml -o LogLevel=INFO',
      ]),
    });
    if (!jobRes.ok) {
      throw new Error(`Job submission failed: ${jobRes.status}`);
    }
    const jobData = await jobRes.json();
    const jobId: number = jobData[0].JobID;

    // Step 4: Assign the sandbox to the job as output sandbox
    const assignRes = await fetch(
      `${baseUrl}/api/jobs/${jobId}/sandbox/output`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sandboxPfn),
      },
    );
    if (!assignRes.ok) {
      throw new Error(`Sandbox assignment failed: ${assignRes.status}`);
    }

    return jobId;
  });
}

/**
 * Ensure there are at least `minNumberOfJobs` in the table.
 * If not, add jobs and refresh. Call after the table is visible.
 */
export function ensureMinimumJobs(minNumberOfJobs: number) {
  cy.get('[data-testid="loading-skeleton"]').should("not.exist");

  cy.get("body").then(($body) => {
    if (
      $body.find('div:contains("No data or no results match your filters.")')
        .length > 0
    ) {
      cy.log("No data available, adding jobs");
      addJobs(minNumberOfJobs);
      // Wait for the jobs to be created on the backend
      cy.wait(2000);
    } else {
      cy.log("Data available, checking if enough jobs are present");
      cy.get(".MuiTablePagination-displayedRows").then(($pagination) => {
        const lastNumber = parseInt($pagination.text().split(" ").pop() || "0");

        if (lastNumber < minNumberOfJobs) {
          const numberOfJobsToAdd = minNumberOfJobs - lastNumber;
          addJobs(numberOfJobsToAdd);
        } else {
          cy.get("table").should("be.visible");
        }
      });
    }

    // Refresh the jobs
    cy.get('[data-testid="refresh-search-button"]').click();
  });
}
