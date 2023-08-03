/// <reference types="cypress" />

// Test sign in
describe('Signin', () => {

    it('should signin a user', () => {
        cy.visit('https://localhost:8080/');
        cy.contains('a', 'Sign In').click();
        cy.get('#signin-email').type('existing_user');
        cy.get('#signin-password').click();
        cy.get('#signin-password').type('1234');
        cy.get('#signin-submit').click();
        cy.url().should('contains', 'https://localhost:8080/todos.html');
        cy.get('#signout-submit').click();
        cy.url().should('contains', 'https://localhost:8080/');

    });

    it('should not signin a user with wrong password', () => {
        const alertStub = cy.stub()
        cy.on('window:alert', alertStub)
        cy.visit('https://localhost:8080/');
        cy.contains('a', 'Sign In').click();
        cy.get('#signin-email').type('existing_user');
        cy.get('#signin-password').click();
        cy.get('#signin-password').type('wrongpassword');
        cy.get('#signin-submit').click();

        // Check that alert "Invalid email or password" is visible
        cy.wrap(alertStub).should('be.calledWith', 'Error code 401:\nInvalid email or password')
    });
});
