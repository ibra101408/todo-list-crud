/// <reference types="cypress" />


describe('addTask', () => {
    it('should signin a user', () => {
        cy.visit('https://localhost:8080/');
        cy.contains('a', 'Sign In').click();
        cy.get('#signin-email').click();
        cy.get('#signin-email').type('existing_user');
        cy.get('#signin-password').click();
        cy.get('#signin-password').type('1234');
        cy.get('#signin-submit').click();
        cy.url().should('contains', 'https://localhost:8080/todos');
        cy.get('[data-cy=add-item-input]').click();
        cy.get('[data-cy=add-item-input]').type("existing_user's Task" );
        cy.get('[data-cy=add-item-button]').click();
        cy.get('#signout-submit').click();
        cy.url().should('contains', 'https://localhost:8080/');
        cy.contains('a', 'Sign In').click();
        cy.get('#signin-email').click();
        cy.get('#signin-email').type('root');
        cy.get('#signin-password').click();
        cy.get('#signin-password').type('root');
        cy.get('#signin-submit').click();
        cy.url().should('contains', 'https://localhost:8080/todos');
        cy.get('.todo-list li').should('not.contain', "existing_user's Task");

    });
});
