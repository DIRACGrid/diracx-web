# Managing web dependencies

## Updating dependencies

[Dependabot](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/managing-pull-requests-for-dependency-updates) is a GitHub-integrated tool that automates dependency management by regularly checking for updates and creating pull requests (PRs) to keep your project's dependencies current. 

!!! info "Weekly Schedule"
    In the `diracx-web` repository, Dependabot is configured to run weekly, generating PRs for any outdated or vulnerable dependencies.

=== "Review PRs"

    **Access PRs**
    : Navigate to the repository's "Pull Requests" section to view Dependabot's submissions.

    **Examine Changes** 
    : Assess the proposed updates, paying close attention to any major version changes that might introduce breaking changes.

=== "Verify Tests"

    **Automated Tests**
    : Ensure that all continuous integration (CI) checks and automated tests pass successfully for each Dependabot PR.

    **Handle Failures**
    : If tests fail, investigate the cause by reviewing the dependency's changelog or release notes to identify any breaking changes or incompatibilities.

=== "Adapt Code"

    **Local Development**
    : ```bash title="Working with Dependabot branches"
      # Check out the PR branch locally
      git checkout dependabot/branch-name
      
      # Run tests locally
      npm test
      
      # Make necessary fixes
      # ... edit code ...
      
      # Test your changes
      npm run test:diracx-web-components
      npm run --prefix packages/diracx-web test
      ```

    **Implement Fixes**
    : Modify the codebase to address any issues introduced by the dependency update.

=== "Merge & Monitor"

    **Final Review**
    : Once tests pass and the codebase is stable, proceed to merge the PR into the main branch.

    **Post-Merge Actions**
    : Monitor the application post-deployment to ensure that the update does not introduce any unforeseen issues.

    !!! warning "Deployment Monitoring"
        Keep a close eye on the application after dependency updates to catch any unexpected issues early.

## Managing Security Vulnerabilities

Dependabot also helps in identifying and addressing security vulnerabilities in your project's dependencies. When a vulnerability is detected, Dependabot generates alerts and can automatically create PRs to update the affected dependencies.

!!! danger "Security Alert Process"
    Navigate to the repository's **"Security"** tab and select **"Dependabot alerts"** to view any security vulnerabilities identified in the dependencies.

    **Priority Levels:**
    
    - **Critical**: Immediate action required
    - **High**: Address within 1 week  
    - **Medium**: Address within 1 month
    - **Low**: Address during next maintenance cycle

!!! tip "Proactive Security"
    Enable GitHub's security alerts and automatic security updates for immediate notification of vulnerabilities in your dependencies.
