/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Log in via the OIDC provider and cache the session.
     * Uses cy.session() so the login flow only runs once per spec.
     */
    login(): Chainable<void>;

    /**
     * Visit the app and wait for the OIDC provider to initialize.
     * Use this instead of cy.visit("/") after cy.login().
     */
    visitApp(): Chainable<void>;
  }
}
