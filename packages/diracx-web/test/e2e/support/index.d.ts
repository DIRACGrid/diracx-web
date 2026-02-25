/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Log in via the OIDC provider and cache the session.
     * Uses cy.session() so the login flow only runs once per spec.
     */
    login(): Chainable<void>;
  }
}
