/// <reference types="cypress" />


describe('editTask', () => {
    it('should edit task and mark it as complete', () => {
        cy.visit('https://localhost:8080/');
        cy.contains('a', 'Sign In').click();
        cy.get('#signin-email').click();
        cy.get('#signin-email').type('existing_user');
        cy.get('#signin-password').click();
        cy.get('#signin-password').type('1234');
        cy.get('#signin-submit').click();
        cy.url().should('contains', 'https://localhost:8080/todos.html');
        // Locate the task containing the text "hello, world"
        //cy.get('.edit-button');
        cy.contains('.task-description', "existing_user's Task", { matchCase: false })
            .parents('li')
            .within(() => {
                cy.get('.edit-button').click();

            });
        cy.get('[data-cy=edit-description]').type(" old");
        cy.get('[data-cy=update-button]').click();
        cy.contains('.task-description', "old", { matchCase: false })
            .parents('li')
            .within(() => {
                cy.get('[data-cy=complete-btn]').click();
            });

    });
});
