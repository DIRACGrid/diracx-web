# Managing dependencies

## Updating dependencies

[Dependabot](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/managing-pull-requests-for-dependency-updates) is a GitHub-integrated tool that automates dependency management by regularly checking for updates and creating pull requests (PRs) to keep your project's dependencies current. In the `diracx-web` repository, Dependabot is configured to run weekly, generating PRs for any outdated or vulnerable dependencies.

1. **Review Dependabot PRs:**
   - **Access PRs:** Navigate to the repository's "Pull Requests" section to view Dependabot's submissions.
   - **Examine Changes:** Assess the proposed updates, paying close attention to any major version changes that might introduce breaking changes.

2. **Verify Test Results:**
   - **Automated Tests:** Ensure that all continuous integration (CI) checks and automated tests pass successfully for each Dependabot PR.
   - **Handle Failures:** If tests fail, investigate the cause by reviewing the dependency's changelog or release notes to identify any breaking changes or incompatibilities.

3. **Adapt Code if Necessary:**
   - **Local Checkout:** Check out the PR branch locally.
   - **Implement Fixes:** Modify the codebase to address any issues introduced by the dependency update.
   - **Test Changes:** Run the test suite locally to confirm that your changes resolve the issues.
   - **Push Updates:** After making the necessary adjustments, commit and push your changes to the Dependabot branch.

4. **Merge PRs:**
   - **Final Review:** Once tests pass and the codebase is stable, proceed to merge the PR into the main branch.
   - **Post-Merge Actions:** Monitor the application post-deployment to ensure that the update does not introduce any unforeseen issues.

## Managing Security Vulnerabilities

Dependabot also helps in identifying and addressing security vulnerabilities in your project's dependencies. When a vulnerability is detected, Dependabot generates alerts and can automatically create PRs to update the affected dependencies.

Navigate to the repository's "Security" tab and select "Dependabot alerts" to view any security vulnerabilities identified in the dependencies.
